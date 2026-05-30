/**
 * Printify → Medusa Product Sync Script
 * 
 * Fetches products from Printify API and creates/updates them in Medusa v2.
 * Downloads mockup images from Printify and uploads them to Supabase S3.
 * 
 * Run with: node scripts/sync-printify-to-medusa.js [--dry-run]
 */

const { Client } = require('pg');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');
const os = require('os');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });

// Initialize S3 client for image uploads
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
});

const PRINTIFY_API = 'https://api.printify.com/v1';

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function toId(prefix, ...parts) {
  return prefix + Buffer.from(parts.join('-')).toString('base64url').slice(0, 22);
}

function enabledVariants(pp) {
  return (pp.variants || []).filter((v) => v.is_enabled !== false);
}

async function printifyFetch(path) {
  const res = await fetch(`${PRINTIFY_API}${path}`, {
    headers: { Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Printify API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, {
      headers: { Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}` },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`Download failed: ${res.statusCode}`));
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(destPath); });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Download timeout')); });
  });
}

async function uploadToS3(filePath, key, contentType) {
  // Use Supabase S3-compatible API
  const s3Endpoint = process.env.S3_ENDPOINT;
  const s3Bucket = process.env.S3_BUCKET;
  const s3Key = process.env.S3_ACCESS_KEY_ID;
  const s3Secret = process.env.S3_SECRET_ACCESS_KEY;
  const s3Prefix = process.env.S3_PREFIX || 'medusa/';

  const fileContent = fs.readFileSync(filePath);
  const fullKey = s3Prefix + key;

  // Build the S3 upload URL
  const uploadUrl = `${s3Endpoint}/${s3Bucket}/${fullKey}`;

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType || 'image/jpeg',
      'x-amz-acl': 'public-read',
    },
    body: fileContent,
    // Supabase S3 uses basic auth
    // Actually we need to use AWS signature V4 or the Supabase anon key
  });

  if (!res.ok) {
    // Try using the Supabase REST API instead
    const supabaseUrl = s3Endpoint.replace('/storage/v1/s3', '');
    const restUrl = `${supabaseUrl}/storage/v1/object/${s3Bucket}/${fullKey}`;
    const restRes = await fetch(restUrl, {
      method: 'POST',
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Authorization': `Bearer ${ process.env.SUPABASE_SERVICE_KEY || s3Key }`,
      },
      body: fileContent,
    });
    if (!restRes.ok) {
      throw new Error(`S3 upload failed: ${restRes.status} ${await restRes.text().catch(() => '')}`);
    }
  }

  const fileUrl = process.env.S3_FILE_URL;
  return `${fileUrl}/${fullKey}`;
}

async function createProductData(db, pp, productId, salesChannelId, currencies, dryRun) {
  if (dryRun) return;

  const vars = enabledVariants(pp);

  // Create options
  for (const opt of pp.options || []) {
    const optId = toId('opt_', pp.id, String(opt.id || opt.name));
    const values = (opt.values || []).map((v) =>
      typeof v === 'object' ? v.title || v.name || String(v.id) : String(v)
    );

    await db.query(
      `INSERT INTO product_option (id, title, product_id, metadata, created_at, updated_at)
       VALUES ($1,$2,$3,$4,NOW(),NOW()) ON CONFLICT DO NOTHING`,
      [optId, opt.name || 'Option', productId, JSON.stringify({ source: 'printify' })]
    );

    for (const val of values) {
      const valId = toId('optval_', optId, val);
      await db.query(
        `INSERT INTO product_option_value (id, value, option_id, metadata, created_at, updated_at)
         VALUES ($1,$2,$3,$4,NOW(),NOW()) ON CONFLICT DO NOTHING`,
        [valId, val, optId, JSON.stringify({ source: 'printify' })]
      );
    }
  }

  // Create variants with price sets
  for (let i = 0; i < vars.length; i++) {
    const v = vars[i];
    const varId = toId('variant_', String(v.id));
    const priceSetId = toId('pset_', String(v.id));
    const amount = Number(v.price || 0);

    const optValues = {};
    if (v.options && pp.options) {
      v.options.forEach((optValRef, optIdx) => {
        const opt = pp.options[optIdx];
        if (!opt) return;
        const optName = opt.name || `Option ${optIdx + 1}`;
        const optVals = (opt.values || []).map((val) =>
          typeof val === 'object' ? val.title || val.name || String(val.id) : String(val)
        );
        const idx = typeof optValRef === 'number' ? optValRef : parseInt(optValRef, 10);
        optValues[optName] = (idx >= 0 && idx < optVals.length) ? optVals[idx] : String(optValRef);
      });
    }

    await db.query(
      `INSERT INTO product_variant (id, title, sku, product_id, allow_backorder, manage_inventory, metadata, variant_rank, created_at, updated_at)
       VALUES ($1,$2,$3,$4,true,false,$5,$6,NOW(),NOW()) ON CONFLICT DO NOTHING`,
      [varId, v.title || pp.title, v.sku || `printify-${v.id}`, productId,
       JSON.stringify({ source: 'printify', printify_variant_id: v.id, printify_product_id: pp.id }), i]
    );

    await db.query(`INSERT INTO price_set (id, created_at, updated_at) VALUES ($1,NOW(),NOW()) ON CONFLICT DO NOTHING`, [priceSetId]);
    await db.query(
      `INSERT INTO product_variant_price_set (id, variant_id, price_set_id, created_at, updated_at)
       VALUES ($1,$2,$3,NOW(),NOW()) ON CONFLICT DO NOTHING`,
      [toId('pvps_', varId), varId, priceSetId]
    );

    for (const curr of currencies) {
      const rawAmt = JSON.stringify({ value: String(amount), precision: 20 });
      await db.query(
        `INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) ON CONFLICT DO NOTHING`,
        [toId('pr_', varId, curr), priceSetId, curr, amount, rawAmt]
      );
    }

    for (const [optTitle, val] of Object.entries(optValues)) {
      const { rows: [ov] } = await db.query(
        `SELECT ov.id FROM product_option_value ov JOIN product_option o ON o.id = ov.option_id WHERE o.product_id = $1 AND o.title = $2 AND ov.value = $3`,
        [productId, optTitle, val]
      );
      if (ov) {
        await db.query(
          `INSERT INTO product_variant_option (variant_id, option_value_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [varId, ov.id]
        );
      }
    }
  }

  // Images - download from Printify and re-host
  let imageCount = 0;
  for (const img of (pp.images || [])) {
    const srcUrl = img.src || img.url;
    if (!srcUrl || imageCount >= 10) continue; // Max 10 images per product

    try {
      // Download image to temp file
      const ext = path.extname(new URL(srcUrl).pathname) || '.jpg';
      const tmpFile = path.join(os.tmpdir(), `printify-${pp.id}-${imageCount}${ext}`);
      await downloadFile(srcUrl, tmpFile);

      // Check file size
      const stat = fs.statSync(tmpFile);
      if (stat.size === 0) {
        fs.unlinkSync(tmpFile);
        continue;
      }

      // Upload to S3
      const s3Key = `printify/${pp.id}/${imageCount}${ext}`;
      const publicUrl = await uploadToS3Image(tmpFile, s3Key);

      // Insert image record
      await db.query(
        `INSERT INTO image (id, url, product_id, metadata, created_at, updated_at)
         VALUES ($1,$2,$3,$4,NOW(),NOW()) ON CONFLICT DO NOTHING`,
        [toId('img_', pp.id, String(imageCount)), publicUrl, productId,
         JSON.stringify({ source: 'printify', position: img.position || imageCount, originalUrl: srcUrl })]
      );

      imageCount++;
      fs.unlinkSync(tmpFile);
    } catch (err) {
      console.error(`    Image download failed for ${pp.title}: ${err.message}`);
    }
  }

  // Sales channel
  if (salesChannelId) {
    await db.query(
      `INSERT INTO product_sales_channel (id, product_id, sales_channel_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      [toId('psc_', productId, salesChannelId), productId, salesChannelId]
    );
  }
}

async function uploadToS3Image(filePath, key) {
  const fileContent = fs.readFileSync(filePath);
  const contentType = getContentType(filePath);

  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    ACL: 'public-read',
  }));

  return `${process.env.S3_FILE_URL}/${key}`;
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
  return types[ext] || 'image/jpeg';
}

async function removeProductData(db, productId) {
  await db.query(`DELETE FROM image WHERE product_id = $1`, [productId]);
  await db.query(`DELETE FROM product_variant_option WHERE variant_id IN (SELECT id FROM product_variant WHERE product_id = $1)`, [productId]);
  await db.query(`DELETE FROM price WHERE price_set_id IN (SELECT pvs.price_set_id FROM product_variant_price_set pvs JOIN product_variant pv ON pv.id = pvs.variant_id WHERE pv.product_id = $1)`, [productId]);
  await db.query(`DELETE FROM product_variant_price_set WHERE variant_id IN (SELECT id FROM product_variant WHERE product_id = $1)`, [productId]);
  await db.query(`DELETE FROM price_set WHERE id IN (SELECT pvs.price_set_id FROM product_variant_price_set pvs JOIN product_variant pv ON pv.id = pvs.variant_id WHERE pv.product_id = $1)`, [productId]);
  await db.query(`DELETE FROM product_variant WHERE product_id = $1`, [productId]);
  await db.query(`DELETE FROM product_sales_channel WHERE product_id = $1`, [productId]);
  await db.query(`DELETE FROM product_option_value WHERE option_id IN (SELECT id FROM product_option WHERE product_id = $1)`, [productId]);
  await db.query(`DELETE FROM product_option WHERE product_id = $1`, [productId]);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  const shopId = process.env.PRINTIFY_SHOP_ID;
  console.log(`\n=== Printify Sync: Shop ${shopId} ${dryRun ? '(DRY RUN)' : ''} ===\n`);

  const { rows: [store] } = await db.query('SELECT default_sales_channel_id FROM store LIMIT 1');
  const salesChannelId = store?.default_sales_channel_id;
  const { rows: regions } = await db.query('SELECT currency_code FROM region');
  const currencies = [...new Set(regions.map((r) => r.currency_code))];
  if (!currencies.includes('usd')) currencies.unshift('usd');

  console.log('Sales channel:', salesChannelId);
  console.log('Currencies:', currencies.join(', '));

  const allProducts = [];
  let page = 1;
  let lastPage = 1;
  do {
    const data = await printifyFetch(`/shops/${shopId}/products.json?page=${page}&limit=50`);
    allProducts.push(...(data.data || []));
    lastPage = data.last_page || 1;
    page++;
  } while (page <= lastPage);

  console.log(`Fetched ${allProducts.length} products from Printify\n`);

  let created = 0, updated = 0, skipped = 0, errors = 0;

  for (const pp of allProducts) {
    const vars = enabledVariants(pp);
    if (vars.length === 0) {
      console.log(`  SKIP (no enabled variants): ${pp.title}`);
      skipped++;
      continue;
    }

    const productId = toId('prod_', pp.id);
    const handle = slugify(pp.title).slice(0, 60) + '-' + pp.id.replace(/[^a-z0-9]/g, '').slice(-6);

    try {
      const { rows: existing } = await db.query('SELECT id FROM product WHERE external_id = $1', [`printify:${pp.id}`]);

      if (existing.length > 0) {
        if (!dryRun) {
          await db.query(
            `UPDATE product SET title=$1, description=$2, thumbnail=$3, metadata=$4, updated_at=NOW() WHERE id=$5`,
            [pp.title, pp.description || null,
             (pp.images || []).find((i) => i.is_default)?.src || (pp.images || [])[0]?.src || null,
             JSON.stringify({ source: 'printify', printify_product_id: pp.id, printify_shop_id: shopId, printify_blueprint_id: pp.blueprint_id, printify_visible: pp.visible }),
             existing[0].id]
          );
          await removeProductData(db, existing[0].id);
          await createProductData(db, pp, existing[0].id, salesChannelId, currencies, dryRun);
        }
        console.log(`  UPDATE: ${pp.title}`);
        updated++;
      } else {
        if (!dryRun) {
          await db.query(
            `INSERT INTO product (id, title, description, handle, status, thumbnail, external_id, discountable, is_giftcard, metadata, created_at, updated_at)
             VALUES ($1,$2,$3,$4,'published',$5,$6,true,false,$7,NOW(),NOW())`,
            [productId, pp.title, pp.description || null, handle,
             (pp.images || []).find((i) => i.is_default)?.src || (pp.images || [])[0]?.src || null,
             `printify:${pp.id}`,
             JSON.stringify({ source: 'printify', printify_product_id: pp.id, printify_shop_id: shopId, printify_blueprint_id: pp.blueprint_id, printify_visible: pp.visible })]
          );
          await createProductData(db, pp, productId, salesChannelId, currencies, dryRun);
        }
        console.log(`  CREATE: ${pp.title} (${vars.length} variants)`);
        created++;
      }
    } catch (err) {
      console.error(`  ERROR: ${pp.title} - ${err.message}`);
      errors++;
    }
  }

  const { rows: [t1] } = await db.query("SELECT COUNT(*) FROM product WHERE metadata->>'source' = 'printify'");
  const { rows: [t2] } = await db.query("SELECT COUNT(*) FROM product_variant pv JOIN product p ON p.id = pv.product_id WHERE p.metadata->>'source' = 'printify'");

  console.log(`\n=== RESULTS ===`);
  console.log(`Created:  ${created}`);
  console.log(`Updated:  ${updated}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Errors:   ${errors}`);
  console.log(`Products: ${t1.count} | Variants: ${t2.count}`);

  await db.end();
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });

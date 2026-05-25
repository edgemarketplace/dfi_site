import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const ensureArray = <T>(value: T | T[] | undefined | null) =>
  Array.isArray(value) ? value : value ? [value] : []

const mapPrintifyProductToMedusa = (product: any, status: string) => {
  const options = ensureArray(product.options)
  const images = ensureArray(product.images)
  const variants = ensureArray(product.variants)

  return {
    title: product.title,
    subtitle: product.blueprint_id
      ? `Printify blueprint ${product.blueprint_id}`
      : undefined,
    description: product.description || undefined,
    handle: `${slugify(product.title || `printify-${product.id}`)}-${product.id}`,
    status,
    thumbnail:
      images.find((image) => image.is_default)?.src || images[0]?.src || undefined,
    images: images
      .map((image) => ({ url: image.src }))
      .filter((image) => Boolean(image.url)),
    options: options.map((option: any) => ({
      title: option.name,
      values: ensureArray(option.values).map((value) => ({ value: String(value) })),
    })),
    variants: variants.map((variant: any) => {
      const optionValues: Record<string, string> = {}

      ensureArray(variant.options).forEach((value: any, index: number) => {
        const optionTitle = options[index]?.name || `Option ${index + 1}`
        optionValues[optionTitle] = String(value)
      })

      return {
        title: variant.title || product.title,
        sku: variant.sku || `printify-${variant.id}`,
        allow_backorder: true,
        manage_inventory: false,
        options: optionValues,
        weight: variant.grams ? Number(variant.grams) : undefined,
        metadata: {
          printify_variant_id: variant.id,
          printify_variant_price: variant.price,
          printify_variant_is_enabled: variant.is_enabled,
        },
      }
    }),
    external_id: `printify:${product.id}`,
    metadata: {
      source: "printify",
      printify_product_id: product.id,
      printify_shop_id: product.shop_id,
      printify_blueprint_id: product.blueprint_id,
      printify_provider_id: product.print_provider_id,
      printify_visible: product.visible,
      printify_is_locked: product.is_locked,
    },
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const apiToken = process.env.PRINTIFY_API_TOKEN
  const shopId = process.env.PRINTIFY_SHOP_ID

  if (!apiToken || !shopId) {
    return res.status(400).json({
      message: "PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID must be configured.",
    })
  }

  const body = ((req as any).body || {}) as {
    limit?: number
    product_ids?: string[]
    status?: string
    dry_run?: boolean
  }

  const response = await fetch(
    `https://api.printify.com/v1/shops/${shopId}/products.json`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    }
  )

  if (!response.ok) {
    const text = await response.text()
    return res.status(response.status).json({
      message: `Printify request failed: ${text}`,
    })
  }

  const payload = await response.json()
  const allProducts = ensureArray(payload.data || payload)
  const filteredProducts = allProducts
    .filter((product: any) =>
      body.product_ids?.length ? body.product_ids.includes(String(product.id)) : true
    )
    .slice(0, Math.max(1, Math.min(Number(body.limit || 25), 100)))

  const defaultStatus =
    body.status || process.env.PRINTIFY_SYNC_DEFAULT_STATUS || "draft"
  const mapped = filteredProducts.map((product: any) =>
    mapPrintifyProductToMedusa(product, defaultStatus)
  )

  if (body.dry_run !== false) {
    return res.status(200).json({
      dry_run: true,
      count: mapped.length,
      products: mapped,
    })
  }

  const productModuleService: any = req.scope.resolve(Modules.PRODUCT)
  const results = {
    created: [] as Array<Record<string, unknown>>,
    updated: [] as Array<Record<string, unknown>>,
    skipped: [] as Array<Record<string, unknown>>,
  }

  for (const product of mapped) {
    const existing = await productModuleService.listProducts(
      { external_id: product.external_id },
      { select: ["id", "external_id", "title"] }
    )

    if (existing.length) {
      const updated = await productModuleService.upsertProducts({
        id: existing[0].id,
        title: product.title,
        subtitle: product.subtitle,
        description: product.description,
        handle: product.handle,
        status: product.status,
        thumbnail: product.thumbnail,
        images: product.images,
        metadata: product.metadata,
      })

      results.updated.push({
        id: updated.id,
        external_id: updated.external_id,
        title: updated.title,
      })
      continue
    }

    const created = await productModuleService.createProducts(product)
    results.created.push({
      id: created.id,
      external_id: created.external_id,
      title: created.title,
    })
  }

  return res.status(200).json({
    dry_run: false,
    ...results,
  })
}

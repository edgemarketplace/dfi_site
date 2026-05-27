import { defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const isProduction = process.env.NODE_ENV === "production"

const resolveEnv = (...keys: string[]) => {
  for (const key of keys) {
    const value = process.env[key]

    if (typeof value === "string" && value.length > 0) {
      return value
    }
  }

  return undefined
}

const parseBoolean = (value?: string) => {
  if (!value) {
    return false
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase())
}

const stripePlatformFeePercent = Number(
  process.env.STRIPE_PLATFORM_FEE_PERCENT || "5"
)

const s3Endpoint = resolveEnv("S3_ENDPOINT", "SUPABASE_STORAGE_ENDPOINT")
const s3FileUrl = resolveEnv("S3_FILE_URL", "SUPABASE_STORAGE_FILE_URL")
const s3Bucket = resolveEnv("S3_BUCKET", "SUPABASE_STORAGE_BUCKET")
const s3Region = resolveEnv("S3_REGION", "SUPABASE_STORAGE_REGION") || "us-east-1"
const s3AccessKeyId = resolveEnv(
  "S3_ACCESS_KEY_ID",
  "SUPABASE_STORAGE_ACCESS_KEY_ID"
)
const s3SecretAccessKey = resolveEnv(
  "S3_SECRET_ACCESS_KEY",
  "SUPABASE_STORAGE_SECRET_ACCESS_KEY"
)
const s3Prefix = resolveEnv("S3_PREFIX", "SUPABASE_STORAGE_PREFIX")
const s3ForcePathStyle = parseBoolean(
  resolveEnv("S3_FORCE_PATH_STYLE", "SUPABASE_STORAGE_FORCE_PATH_STYLE")
)

const s3ProviderEnabled = Boolean(
  s3Endpoint && s3FileUrl && s3Bucket && s3AccessKeyId && s3SecretAccessKey
)

if (isProduction) {
  const requiredProductionVars = [
    "JWT_SECRET",
    "COOKIE_SECRET",
    "STORE_CORS",
    "ADMIN_CORS",
    "AUTH_CORS",
  ]

  const missingProductionVars = requiredProductionVars.filter(
    (key) => !process.env[key]
  )

  if (missingProductionVars.length) {
    throw new Error(
      `Missing required production env vars: ${missingProductionVars.join(", ")}`
    )
  }
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "dev_jwt_secret",
      cookieSecret: process.env.COOKIE_SECRET || "dev_cookie_secret",
    },
  },
  modules: [
    {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: "./src/providers/stripe-connect",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              capture: true,
              automaticPaymentMethods: true,
              paymentDescription:
                process.env.STRIPE_PAYMENT_DESCRIPTION ||
                "Defend Freedom Industries order",
              platformFeePercent: stripePlatformFeePercent,
              connectAccountId: process.env.STRIPE_CONNECT_ACCOUNT_ID,
              onBehalfOf:
                process.env.STRIPE_ON_BEHALF_OF ||
                process.env.STRIPE_CONNECT_ACCOUNT_ID,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/notification",
      options: {
        providers: [
          {
            resolve: "./src/providers/resend",
            id: "resend",
            options: {
              api_key: process.env.RESEND_API_KEY,
              from:
                process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM,
              reply_to: process.env.RESEND_REPLY_TO,
              channels: ["email"],
            },
          },
        ],
      },
    },
    // Only load File module if S3 is configured
    ...(s3ProviderEnabled
      ? [
          {
            resolve: "@medusajs/file",
            options: {
              providers: [
                {
                  resolve: "@medusajs/file-s3",
                  id: "s3",
                  options: {
                    endpoint: s3Endpoint,
                    file_url: s3FileUrl,
                    bucket: s3Bucket,
                    region: s3Region,
                    access_key_id: s3AccessKeyId,
                    secret_access_key: s3SecretAccessKey,
                    prefix: s3Prefix,
                    additional_client_config: {
                      forcePathStyle: s3ForcePathStyle,
                    },
                  },
                },
              ],
            },
          },
        ]
      : []),
    {
      resolve: "@medusajs/fulfillment",
      options: {
        providers: [
          {
            resolve: "./src/providers/shippo",
            id: "shippo",
            options: {
              api_key: process.env.SHIPPO_API_TOKEN,
              from_address_name: process.env.SHIPPO_FROM_NAME,
              from_address_company: process.env.SHIPPO_FROM_COMPANY,
              from_address_street1: process.env.SHIPPO_FROM_STREET1,
              from_address_street2: process.env.SHIPPO_FROM_STREET2,
              from_address_city: process.env.SHIPPO_FROM_CITY,
              from_address_state: process.env.SHIPPO_FROM_STATE,
              from_address_zip: process.env.SHIPPO_FROM_ZIP,
              from_address_country: process.env.SHIPPO_FROM_COUNTRY,
              from_address_phone: process.env.SHIPPO_FROM_PHONE,
              default_parcel_length: process.env.SHIPPO_DEFAULT_PARCEL_LENGTH,
              default_parcel_width: process.env.SHIPPO_DEFAULT_PARCEL_WIDTH,
              default_parcel_height: process.env.SHIPPO_DEFAULT_PARCEL_HEIGHT,
              default_parcel_distance_unit:
                process.env.SHIPPO_DEFAULT_PARCEL_DISTANCE_UNIT || "in",
              default_parcel_weight: process.env.SHIPPO_DEFAULT_PARCEL_WEIGHT,
              default_parcel_mass_unit:
                process.env.SHIPPO_DEFAULT_PARCEL_MASS_UNIT || "lb",
            },
          },
        ],
      },
    },
  ],
  admin: {
    disable: true,
  },
})

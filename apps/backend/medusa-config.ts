import { defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const stripePlatformFeePercent = Number(
  process.env.STRIPE_PLATFORM_FEE_PERCENT || "5"
)

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: [
    {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: "./src/providers/stripe-connect",
            id: "stripe",
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
            },
          },
        ],
      },
    },
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

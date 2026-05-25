import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const configured = (value?: string) => Boolean(value && value.trim())

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const stripeConnectEnabled = configured(process.env.STRIPE_CONNECT_ACCOUNT_ID)
  const stripePlatformFeePercent = Number(
    process.env.STRIPE_PLATFORM_FEE_PERCENT || "5"
  )

  res.status(200).json({
    backend: {
      baseUrl: process.env.MEDUSA_BACKEND_URL || null,
      storeCors: process.env.STORE_CORS || null,
      adminCors: process.env.ADMIN_CORS || null,
      authCors: process.env.AUTH_CORS || null,
    },
    stripe: {
      apiKeyConfigured: configured(process.env.STRIPE_API_KEY),
      webhookSecretConfigured: configured(process.env.STRIPE_WEBHOOK_SECRET),
      connectAccountConfigured: stripeConnectEnabled,
      platformFeePercent: stripePlatformFeePercent,
      paymentWebhookPath: "/hooks/payment/stripe_stripe",
      ready:
        configured(process.env.STRIPE_API_KEY) &&
        configured(process.env.STRIPE_WEBHOOK_SECRET),
    },
    resend: {
      apiKeyConfigured: configured(process.env.RESEND_API_KEY),
      fromConfigured:
        configured(process.env.RESEND_FROM_EMAIL) ||
        configured(process.env.RESEND_FROM),
      ready:
        configured(process.env.RESEND_API_KEY) &&
        (configured(process.env.RESEND_FROM_EMAIL) ||
          configured(process.env.RESEND_FROM)),
    },
    shippo: {
      apiKeyConfigured: configured(process.env.SHIPPO_API_TOKEN),
      originAddressConfigured: [
        process.env.SHIPPO_FROM_NAME,
        process.env.SHIPPO_FROM_STREET1,
        process.env.SHIPPO_FROM_CITY,
        process.env.SHIPPO_FROM_STATE,
        process.env.SHIPPO_FROM_ZIP,
        process.env.SHIPPO_FROM_COUNTRY,
      ].every((value) => configured(value)),
      ready:
        configured(process.env.SHIPPO_API_TOKEN) &&
        configured(process.env.SHIPPO_FROM_STREET1) &&
        configured(process.env.SHIPPO_FROM_CITY) &&
        configured(process.env.SHIPPO_FROM_ZIP) &&
        configured(process.env.SHIPPO_FROM_COUNTRY),
    },
    printify: {
      apiTokenConfigured: configured(process.env.PRINTIFY_API_TOKEN),
      shopIdConfigured: configured(process.env.PRINTIFY_SHOP_ID),
      syncDefaultStatus: process.env.PRINTIFY_SYNC_DEFAULT_STATUS || "draft",
      ready:
        configured(process.env.PRINTIFY_API_TOKEN) &&
        configured(process.env.PRINTIFY_SHOP_ID),
    },
  })
}

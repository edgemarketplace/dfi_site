import {
  ModuleProvider,
  Modules,
  PaymentSessionStatus,
  MedusaError,
} from "@medusajs/framework/utils"
import { StripeProviderService } from "@medusajs/payment-stripe/dist/services"
import { getSmallestUnit } from "@medusajs/payment-stripe/dist/utils/get-smallest-unit"

type StripeConnectOptions = {
  apiKey: string
  webhookSecret?: string
  capture?: boolean
  automaticPaymentMethods?: boolean
  paymentDescription?: string
  platformFeePercent?: number
  connectAccountId?: string
  onBehalfOf?: string
}

class StripeConnectService extends StripeProviderService {
  static identifier = "stripe"

  protected readonly stripeConnectOptions_: StripeConnectOptions

  constructor(container: Record<string, unknown>, options: StripeConnectOptions) {
    super(container, options)
    this.stripeConnectOptions_ = options
  }

  private getPlatformFeeAmount(amount: number, currencyCode: string) {
    const feePercent = Number(this.stripeConnectOptions_.platformFeePercent || 0)

    if (!feePercent) {
      return undefined
    }

    const smallestUnitAmount = getSmallestUnit(amount, currencyCode)

    return Math.round((smallestUnitAmount * feePercent) / 100)
  }

  private mapPaymentStatus(paymentIntent: any) {
    switch (paymentIntent.status) {
      case "requires_payment_method":
        if (paymentIntent.last_payment_error) {
          return { status: PaymentSessionStatus.ERROR, data: paymentIntent }
        }
        return { status: PaymentSessionStatus.PENDING, data: paymentIntent }
      case "requires_confirmation":
      case "processing":
        return { status: PaymentSessionStatus.PENDING, data: paymentIntent }
      case "requires_action":
        return { status: PaymentSessionStatus.REQUIRES_MORE, data: paymentIntent }
      case "canceled":
        return { status: PaymentSessionStatus.CANCELED, data: paymentIntent }
      case "requires_capture":
        return { status: PaymentSessionStatus.AUTHORIZED, data: paymentIntent }
      case "succeeded":
        return { status: PaymentSessionStatus.CAPTURED, data: paymentIntent }
      default:
        return { status: PaymentSessionStatus.PENDING, data: paymentIntent }
    }
  }

  private getConnectOverrides(amount: number, currencyCode: string) {
    const destination = this.stripeConnectOptions_.connectAccountId

    if (!destination) {
      return {}
    }

    const applicationFeeAmount = this.getPlatformFeeAmount(amount, currencyCode)

    return {
      transfer_data: {
        destination,
      },
      on_behalf_of: this.stripeConnectOptions_.onBehalfOf || destination,
      ...(applicationFeeAmount
        ? { application_fee_amount: applicationFeeAmount }
        : {}),
    }
  }

  async initiatePayment({ currency_code, amount, data, context }: any) {
    const additionalParameters = this.normalizePaymentIntentParameters(data)
    const intentRequest: Record<string, unknown> = {
      amount: getSmallestUnit(amount, currency_code),
      currency: currency_code,
      metadata: {
        ...(data?.metadata ?? {}),
        session_id: data?.session_id,
      },
      ...additionalParameters,
      ...this.getConnectOverrides(amount, currency_code),
    }

    intentRequest.customer = context?.account_holder?.data?.id

    const sessionData: any = await this.executeWithRetry(() =>
      this.stripe_.paymentIntents.create(intentRequest as any, {
        idempotencyKey: context?.idempotency_key,
      })
    )

    const isPaymentIntent = "id" in sessionData

    return {
      id: isPaymentIntent ? sessionData.id : data?.session_id,
      ...this.mapPaymentStatus(sessionData),
    }
  }

  async updatePayment({ data, currency_code, amount, context }: any) {
    const amountNumeric = getSmallestUnit(amount, currency_code)

    if (typeof amount !== "undefined" && data?.amount === amountNumeric) {
      return this.mapPaymentStatus(data)
    }

    try {
      const id = data?.id

      if (!id) {
        throw new Error("No payment intent ID provided")
      }

      const sessionData = await this.stripe_.paymentIntents.update(
        id,
        {
          amount: amountNumeric,
          ...this.getConnectOverrides(amount, currency_code),
        },
        {
          idempotencyKey: context?.idempotency_key,
        }
      )

      return this.mapPaymentStatus(sessionData)
    } catch (e: any) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `An error occurred in updatePayment: ${e?.message || "unknown error"}`
      )
    }
  }
}

export default ModuleProvider(Modules.PAYMENT, {
  services: [StripeConnectService],
})

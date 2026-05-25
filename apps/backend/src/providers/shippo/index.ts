import {
  AbstractFulfillmentProviderService,
  MedusaError,
  ModuleProvider,
  Modules,
} from "@medusajs/framework/utils"
import type {
  CalculatedShippingOptionPrice,
  CreateFulfillmentResult,
  FulfillmentOption,
} from "@medusajs/types"

type ShippoOptions = {
  api_key?: string
  from_address_name?: string
  from_address_company?: string
  from_address_street1?: string
  from_address_street2?: string
  from_address_city?: string
  from_address_state?: string
  from_address_zip?: string
  from_address_country?: string
  from_address_phone?: string
  default_parcel_length?: string
  default_parcel_width?: string
  default_parcel_height?: string
  default_parcel_distance_unit?: string
  default_parcel_weight?: string
  default_parcel_mass_unit?: string
}

class ShippoFulfillmentService extends AbstractFulfillmentProviderService {
  static identifier = "shippo"

  protected readonly options_: ShippoOptions

  constructor(_: Record<string, unknown>, options: ShippoOptions) {
    super()
    this.options_ = options || {}
  }

  private requireApiKey() {
    if (!this.options_.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "SHIPPO_API_TOKEN is not configured"
      )
    }
  }

  private getDefaultParcel() {
    return {
      length: this.options_.default_parcel_length || "10",
      width: this.options_.default_parcel_width || "8",
      height: this.options_.default_parcel_height || "4",
      distance_unit: this.options_.default_parcel_distance_unit || "in",
      weight: this.options_.default_parcel_weight || "1",
      mass_unit: this.options_.default_parcel_mass_unit || "lb",
    }
  }

  private getOriginAddress() {
    return {
      name: this.options_.from_address_name,
      company: this.options_.from_address_company,
      street1: this.options_.from_address_street1,
      street2: this.options_.from_address_street2,
      city: this.options_.from_address_city,
      state: this.options_.from_address_state,
      zip: this.options_.from_address_zip,
      country: this.options_.from_address_country,
      phone: this.options_.from_address_phone,
    }
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return [
      {
        id: "shippo",
        name: "Shippo",
      },
      {
        id: "shippo-return",
        name: "Shippo Return",
        is_return: true,
      },
    ]
  }

  async validateFulfillmentData(optionData: Record<string, unknown>, data: Record<string, unknown>) {
    return {
      ...optionData,
      ...data,
    }
  }

  async calculatePrice(optionData: Record<string, unknown>): Promise<CalculatedShippingOptionPrice> {
    const amount = Number(optionData?.amount || 0)

    return {
      calculated_amount: Number.isFinite(amount) ? amount : 0,
      is_calculated_price_tax_inclusive: false,
    }
  }

  async canCalculate(): Promise<boolean> {
    return true
  }

  async validateOption(data: Record<string, any>): Promise<boolean> {
    return typeof data === "object" && data !== null
  }

  async createFulfillment(
    data: Record<string, any> = {},
    items: Array<Record<string, any>> = [],
    order?: Record<string, any>
  ): Promise<CreateFulfillmentResult> {
    this.requireApiKey()

    const toAddress =
      data.to_address ||
      order?.shipping_address ||
      order?.shipping_address?.address ||
      null

    if (!toAddress) {
      return {
        data: {
          provider: "shippo",
          skipped_label_purchase: true,
          reason: "shipping address unavailable",
          items_count: items.length,
        },
        labels: [],
      }
    }

    const shipmentPayload = {
      address_from: {
        ...this.getOriginAddress(),
      },
      address_to: {
        name: toAddress.name || toAddress.first_name || order?.email,
        street1: toAddress.address_1 || toAddress.street1,
        street2: toAddress.address_2 || toAddress.street2,
        city: toAddress.city,
        state: toAddress.province || toAddress.state,
        zip: toAddress.postal_code || toAddress.zip,
        country: toAddress.country_code || toAddress.country,
        email: order?.email,
        phone: toAddress.phone,
      },
      parcels: [data.parcel || this.getDefaultParcel()],
      async: false,
    }

    const shipmentResponse = await fetch("https://api.goshippo.com/shipments/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${this.options_.api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(shipmentPayload),
    })

    if (!shipmentResponse.ok) {
      const text = await shipmentResponse.text()
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Shippo shipment creation failed: ${shipmentResponse.status} ${text}`
      )
    }

    const shipment = await shipmentResponse.json()
    const requestedRateId = data.rate_id || data.shippo_rate_id
    const selectedRate = requestedRateId
      ? shipment.rates?.find((rate: any) => rate.object_id === requestedRateId)
      : shipment.rates?.[0]

    if (!selectedRate?.object_id) {
      return {
        data: {
          provider: "shippo",
          shipment_id: shipment.object_id,
          available_rates: shipment.rates || [],
        },
        labels: [],
      }
    }

    const transactionResponse = await fetch("https://api.goshippo.com/transactions/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${this.options_.api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rate: selectedRate.object_id,
        label_file_type: data.label_file_type || "PDF",
        async: false,
      }),
    })

    if (!transactionResponse.ok) {
      const text = await transactionResponse.text()
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Shippo transaction failed: ${transactionResponse.status} ${text}`
      )
    }

    const transaction = await transactionResponse.json()

    return {
      data: {
        provider: "shippo",
        shipment_id: shipment.object_id,
        transaction_id: transaction.object_id,
        tracking_status: transaction.tracking_status,
        rate_id: selectedRate.object_id,
      },
      labels: transaction.label_url
        ? [
            {
              tracking_number: transaction.tracking_number || "",
              tracking_url: transaction.tracking_url_provider || "",
              label_url: transaction.label_url,
            },
          ]
        : [],
    }
  }

  async cancelFulfillment(fulfillment: Record<string, unknown>) {
    return {
      canceled: true,
      fulfillment,
    }
  }

  async getFulfillmentDocuments(_: Record<string, unknown>): Promise<never[]> {
    return []
  }

  async createReturnFulfillment(fromData: Record<string, unknown>): Promise<CreateFulfillmentResult> {
    return {
      data: {
        provider: "shippo",
        return_requested: true,
        ...fromData,
      },
      labels: [],
    }
  }

  async retrieveDocuments(
    _: Record<string, unknown>,
    __: string
  ): Promise<void> {
    return
  }

  async getReturnDocuments(_: Record<string, unknown>): Promise<never[]> {
    return []
  }

  async getShipmentDocuments(_: Record<string, unknown>): Promise<never[]> {
    return []
  }
}

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [ShippoFulfillmentService],
})

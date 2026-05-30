import {
  type SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id
  const orderModuleService = container.resolve(Modules.ORDER)

  try {
    const order = await orderModuleService.retrieveOrder(orderId, {
      relations: [
        "items",
        "items.variant",
        "items.variant.product",
        "shipping_address",
      ],
    })

    const printifyLineItems = order.items.filter(
      (item) => item.variant?.metadata?.printify_variant_id
    )

    if (printifyLineItems.length === 0) {
      console.log(`Order ${orderId} has no printify items, skipping sync`)
      return
    }

    const apiToken = process.env.PRINTIFY_API_TOKEN
    const shopId = process.env.PRINTIFY_SHOP_ID

    if (!apiToken || !shopId) {
      console.error(
        "PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID must be configured to sync orders to Printify."
      )
      return
    }

    const line_items = printifyLineItems.map((item) => ({
      product_id: String(item.variant?.metadata?.printify_product_id || item.variant?.product?.metadata?.printify_product_id),
      variant_id: Number(item.variant?.metadata?.printify_variant_id),
      quantity: item.quantity,
    }))

    const shippingAddress = order.shipping_address

    if (!shippingAddress) {
      console.error(`Order ${orderId} has no shipping address, skipping printify sync`)
      return
    }

    const printifyOrderPayload = {
      external_id: order.id,
      label: order.display_id ? `Order #${order.display_id}` : `Order ${order.id}`,
      line_items,
      shipping_method: 1, // Standard shipping as requested
      send_shipping_notification: false,
      address_to: {
        first_name: shippingAddress.first_name || "",
        last_name: shippingAddress.last_name || "",
        email: order.email || "no-email@example.com",
        phone: shippingAddress.phone || "",
        country: shippingAddress.country_code?.toUpperCase() || "",
        region: shippingAddress.province || "",
        address1: shippingAddress.address_1 || "",
        address2: shippingAddress.address_2 || "",
        city: shippingAddress.city || "",
        zip: shippingAddress.postal_code || "",
      },
    }

    console.log(`Sending order ${orderId} to printify...`)
    
    const response = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/orders.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(printifyOrderPayload),
      }
    )

    if (!response.ok) {
      const text = await response.text()
      console.error(`Failed to push order ${orderId} to Printify: ${text}`)
    } else {
      console.log(`Successfully pushed order ${orderId} to Printify`)
    }
  } catch (error: any) {
    console.error(
      `Failed to process printify sync for order ${orderId}:`,
      error?.message || error
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}

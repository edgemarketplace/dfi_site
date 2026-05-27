import {
  type SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function orderCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService = container.resolve(Modules.ORDER)

  try {
    // Retrieve order with customer email
    const order = await orderModuleService.retrieveOrder(orderId, {
      select: ["id", "email", "display_id"],
    })

    if (!order?.email) {
      console.warn(`Order ${orderId} has no email, skipping notification`)
      return
    }

    // Send order confirmation to customer
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: "order-created-template",
      trigger_type: "order.created",
      resource_id: order.id,
      data: {
        order_id: order.id,
      },
    })

    console.log(
      `Order confirmation email sent to ${order.email} for order #${order.display_id || order.id}`
    )
  } catch (error: any) {
    console.error(
      `Failed to send order confirmation for order ${orderId}:`,
      error?.message || error
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.completed",
}

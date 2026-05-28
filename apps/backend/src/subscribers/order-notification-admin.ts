import {
  type SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

// Admin email to notify about new orders
const ADMIN_EMAIL = process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL || "admin@defendfreedomindustries.com"

export default async function orderNotificationAdminHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService = container.resolve(Modules.ORDER)

  try {
    // Retrieve order details for admin notification
    const order = await orderModuleService.retrieveOrder(orderId, {
      select: ["id", "display_id", "email", "total", "currency_code", "created_at"],
      relations: ["items"],
    })

    const orderLabel = order.display_id || order.id
    const itemCount = Array.isArray(order.items) ? order.items.length : 0

    // Send admin notification
    await notificationModuleService.createNotifications({
      to: ADMIN_EMAIL,
      channel: "email",
      template: "order-created-template", // Reuse template or create admin-specific one
      trigger_type: "admin.order.notification",
      resource_id: order.id,
      data: {
        order_id: order.id,
        // Override subject for admin
        subject: `New Order #${orderLabel} - ${itemCount} item(s)`,
      },
    })

    console.log(
      `Admin notification sent to ${ADMIN_EMAIL} for order #${orderLabel}`
    )
  } catch (error: any) {
    console.error(
      `Failed to send admin notification for order ${orderId}:`,
      error?.message || error
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.completed",
}

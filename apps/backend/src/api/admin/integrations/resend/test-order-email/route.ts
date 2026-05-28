import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

const DEFAULT_TEST_RECIPIENT = "pembertonventures@gmail.com"

type RequestBody = {
  to?: string
  order_id?: string
}

const sanitizeEmail = (value?: string) => value?.trim() || DEFAULT_TEST_RECIPIENT

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (((req as any).body || {}) as RequestBody) ?? {}
  const to = sanitizeEmail(body.to)

  const orderModuleService: any = req.scope.resolve(Modules.ORDER)
  const notificationModuleService: any = req.scope.resolve(Modules.NOTIFICATION)

  let order: any = null

  if (body.order_id) {
    order = await orderModuleService.retrieveOrder(body.order_id, {
      select: ["id", "display_id", "email", "created_at"],
    })
  } else {
    const latestOrders = await orderModuleService.listOrders(
      {},
      {
        select: ["id", "display_id", "email", "created_at"],
        take: 1,
        order: {
          created_at: "DESC",
        },
      }
    )

    order = latestOrders?.[0] || null
  }

  if (!order?.id) {
    return res.status(400).json({
      message:
        "No order found to use for the test confirmation email. Pass order_id or create an order first.",
    })
  }

  const notification = await notificationModuleService.createNotifications({
    to,
    channel: "email",
    template: "order-created-template",
    trigger_type: "admin.resend.test-order-email",
    resource_id: order.id,
    data: {
      order_id: order.id,
    },
  })

  return res.status(200).json({
    message: "Test order confirmation email queued.",
    to,
    order: {
      id: order.id,
      display_id: order.display_id,
      email: order.email,
      created_at: order.created_at,
    },
    notification: {
      id: notification.id,
      provider_id: notification.provider_id,
      status: notification.status,
      external_id: notification.external_id,
    },
  })
}

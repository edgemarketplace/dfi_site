import {
  AbstractNotificationProviderService,
  MedusaError,
  ModuleProvider,
  Modules,
} from "@medusajs/framework/utils"

type ResendOptions = {
  api_key?: string
  from?: string
  reply_to?: string
  channels?: string[]
}

type InjectedDependencies = Record<string, any> & {
  logger?: {
    info?: (...args: unknown[]) => void
    error?: (...args: unknown[]) => void
    warn?: (...args: unknown[]) => void
  }
}

class ResendNotificationService extends AbstractNotificationProviderService {
  static identifier = "resend"

  protected readonly config_: ResendOptions
  protected readonly logger_: InjectedDependencies["logger"]
  protected readonly orderModuleService_: {
    retrieveOrder?: (id: string, config?: Record<string, unknown>) => Promise<any>
  } | null

  constructor(container: InjectedDependencies, options: ResendOptions) {
    super()
    this.config_ = options || {}
    this.logger_ = container.logger
    this.orderModuleService_ = container[Modules.ORDER] || null
  }

  private escapeHtml(value: unknown) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;")
  }

  private formatMoney(amount?: number | null, currencyCode?: string | null) {
    const normalizedAmount = Number(amount ?? 0)
    const normalizedCurrency = (currencyCode || "usd").toUpperCase()

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: normalizedCurrency,
      }).format(normalizedAmount / 100)
    } catch {
      return `${(normalizedAmount / 100).toFixed(2)} ${normalizedCurrency}`
    }
  }

  private formatAddress(address?: Record<string, any> | null) {
    if (!address) {
      return ""
    }

    return [
      [address.first_name, address.last_name].filter(Boolean).join(" "),
      address.address_1,
      address.address_2,
      [address.city, address.province].filter(Boolean).join(", "),
      [address.postal_code, address.country_code?.toUpperCase()]
        .filter(Boolean)
        .join(" "),
      address.phone,
    ]
      .filter(Boolean)
      .join("\n")
  }

  private async buildOrderCreatedContent(notification: any) {
    const orderId = notification?.data?.order_id

    if (
      notification?.template !== "order-created-template" ||
      !orderId ||
      !this.orderModuleService_?.retrieveOrder
    ) {
      return null
    }

    try {
      const order = await this.orderModuleService_.retrieveOrder(orderId, {
        select: [
          "id",
          "display_id",
          "email",
          "currency_code",
          "total",
          "subtotal",
          "shipping_total",
          "tax_total",
          "created_at",
        ],
        relations: ["items", "shipping_address", "shipping_methods"],
      })

      const orderLabel = order.display_id || order.id
      const subject = `Order #${orderLabel} confirmed`
      const itemRows = Array.isArray(order.items)
        ? order.items
            .map((item: any) => {
              const quantity = Number(item.quantity || 0)
              const title = item.title || item.product_title || "Item"
              const lineTotal =
                typeof item.total === "number"
                  ? this.formatMoney(item.total, order.currency_code)
                  : null

              return {
                text: `- ${title} x${quantity}${lineTotal ? ` — ${lineTotal}` : ""}`,
                html: `<li><strong>${this.escapeHtml(title)}</strong> × ${quantity}${
                  lineTotal
                    ? ` <span style="color:#6b7280;">— ${this.escapeHtml(lineTotal)}</span>`
                    : ""
                }</li>`,
              }
            })
            .filter(Boolean)
        : []

      const shippingMethod = Array.isArray(order.shipping_methods)
        ? order.shipping_methods
            .map((method: any) => method?.name)
            .filter(Boolean)
            .join(", ")
        : ""

      const shippingAddress = this.formatAddress(order.shipping_address)
      const createdAt = order.created_at
        ? new Date(order.created_at).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : ""

      const totals = [
        [`Subtotal`, this.formatMoney(order.subtotal, order.currency_code)],
        [`Shipping`, this.formatMoney(order.shipping_total, order.currency_code)],
        [`Tax`, this.formatMoney(order.tax_total, order.currency_code)],
        [`Total`, this.formatMoney(order.total, order.currency_code)],
      ]

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111827;line-height:1.5;">
          <h1 style="font-size:24px;margin-bottom:8px;">Thanks for your order</h1>
          <p style="margin-top:0;">We received your purchase and are getting it ready.</p>
          <p>
            <strong>Order:</strong> #${this.escapeHtml(orderLabel)}<br />
            ${createdAt ? `<strong>Date:</strong> ${this.escapeHtml(createdAt)}<br />` : ""}
            <strong>Email:</strong> ${this.escapeHtml(order.email || notification.to)}
          </p>
          ${
            itemRows.length
              ? `<h2 style="font-size:18px;margin-top:24px;">Items</h2><ul>${itemRows
                  .map((row) => row.html)
                  .join("")}</ul>`
              : ""
          }
          <h2 style="font-size:18px;margin-top:24px;">Order summary</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tbody>
              ${totals
                .map(
                  ([label, value], index) => `<tr>
                    <td style="padding:6px 0;${
                      index === totals.length - 1 ? "font-weight:700;" : ""
                    }">${this.escapeHtml(label)}</td>
                    <td style="padding:6px 0;text-align:right;${
                      index === totals.length - 1 ? "font-weight:700;" : ""
                    }">${this.escapeHtml(value)}</td>
                  </tr>`
                )
                .join("")}
            </tbody>
          </table>
          ${
            shippingMethod || shippingAddress
              ? `<h2 style="font-size:18px;margin-top:24px;">Delivery</h2>
                 ${shippingMethod ? `<p><strong>Method:</strong> ${this.escapeHtml(shippingMethod)}</p>` : ""}
                 ${shippingAddress ? `<pre style="white-space:pre-wrap;font-family:Arial,sans-serif;">${this.escapeHtml(shippingAddress)}</pre>` : ""}`
              : ""
          }
          <p style="margin-top:24px;">If you have any questions, just reply to this email.</p>
        </div>
      `.trim()

      const text = [
        `Thanks for your order`,
        `Order #${orderLabel} confirmed`,
        createdAt ? `Date: ${createdAt}` : null,
        `Email: ${order.email || notification.to}`,
        itemRows.length ? "" : null,
        itemRows.length ? "Items:" : null,
        ...itemRows.map((row) => row.text),
        "",
        "Order summary:",
        ...totals.map(([label, value]) => `${label}: ${value}`),
        shippingMethod ? "" : null,
        shippingMethod ? `Delivery method: ${shippingMethod}` : null,
        shippingAddress ? "" : null,
        shippingAddress ? `Shipping address:\n${shippingAddress}` : null,
      ]
        .filter(Boolean)
        .join("\n")

      return { subject, html, text }
    } catch (error: any) {
      this.logger_?.warn?.(
        "Failed to build rich order-created email content, falling back to default payload",
        error?.message || error
      )

      return null
    }
  }

  async send(notification: any) {
    if (!notification) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "No notification information provided"
      )
    }

    if (!this.config_.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "RESEND_API_KEY is not configured"
      )
    }

    const from = notification.from?.trim() || this.config_.from

    if (!from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Notification sender is missing. Configure RESEND_FROM_EMAIL."
      )
    }

    const to = Array.isArray(notification.to)
      ? notification.to
      : String(notification.to || "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)

    if (!to.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Notification recipient is missing"
      )
    }

    const generatedContent = await this.buildOrderCreatedContent(notification)

    const subject =
      notification?.content?.subject ||
      notification?.data?.subject ||
      generatedContent?.subject ||
      notification?.template ||
      "Notification from DFI"

    const html =
      generatedContent?.html ||
      notification?.content?.html ||
      notification?.data?.html ||
      notification?.data?.message ||
      `<p>${subject}</p>`

    const text =
      generatedContent?.text ||
      notification?.content?.text ||
      notification?.data?.text

    const attachments = Array.isArray(notification.attachments)
      ? notification.attachments.map((attachment: any) => ({
          filename: attachment.filename,
          content: attachment.content,
          type: attachment.content_type,
          disposition: attachment.disposition || "attachment",
        }))
      : undefined

    const payload: Record<string, unknown> = {
      from,
      to,
      subject,
      html,
      ...(text ? { text } : {}),
      ...(this.config_.reply_to ? { reply_to: this.config_.reply_to } : {}),
      ...(attachments?.length ? { attachments } : {}),
      ...(notification?.data?.cc ? { cc: notification.data.cc } : {}),
      ...(notification?.data?.bcc ? { bcc: notification.data.bcc } : {}),
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config_.api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      this.logger_?.error?.("Resend send failed", errorText)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send email with Resend: ${response.status} ${errorText}`
      )
    }

    const data = await response.json().catch(() => ({}))
    this.logger_?.info?.("Resend notification sent", data?.id)

    return {
      id: data?.id,
    }
  }
}

export default ModuleProvider(Modules.NOTIFICATION, {
  services: [ResendNotificationService],
})
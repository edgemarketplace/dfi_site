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
}

type InjectedDependencies = {
  logger?: {
    info?: (...args: unknown[]) => void
    error?: (...args: unknown[]) => void
  }
}

class ResendNotificationService extends AbstractNotificationProviderService {
  static identifier = "resend"

  protected readonly config_: ResendOptions
  protected readonly logger_: InjectedDependencies["logger"]

  constructor({ logger }: InjectedDependencies, options: ResendOptions) {
    super()
    this.config_ = options || {}
    this.logger_ = logger
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

    const subject =
      notification?.content?.subject ||
      notification?.data?.subject ||
      notification?.template ||
      "Notification from DFI"

    const html =
      notification?.content?.html ||
      notification?.data?.html ||
      notification?.data?.message ||
      `<p>${subject}</p>`

    const text = notification?.content?.text || notification?.data?.text

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

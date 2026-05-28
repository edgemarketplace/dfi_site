import { getLocaleHeader } from "@lib/util/get-locale-header"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

if (process.env.NODE_ENV === "production") {
  if (!process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
    console.warn(
      "[WARNING] NEXT_PUBLIC_MEDUSA_BACKEND_URL must be set in production to avoid falling back to localhost:9000"
    )
  }

  const backendHostname = (() => {
    try {
      return new URL(MEDUSA_BACKEND_URL).hostname
    } catch {
      return null
    }
  })()

  if (["localhost", "127.0.0.1", "0.0.0.0"].includes(backendHostname || "")) {
    console.warn(
      "[WARNING] NEXT_PUBLIC_MEDUSA_BACKEND_URL cannot point to a local host in production"
    )
  }
}

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const headers = init?.headers ?? {}
  let localeHeader: Record<string, string | null> | undefined
  try {
    localeHeader = await getLocaleHeader()
    headers["x-medusa-locale"] ??= localeHeader["x-medusa-locale"]
  } catch {}

  const newHeaders = {
    ...localeHeader,
    ...headers,
  }
  init = {
    ...init,
    headers: newHeaders,
  }
  return originalFetch(input, init)
}

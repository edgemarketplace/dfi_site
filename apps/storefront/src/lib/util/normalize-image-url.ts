const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"])

export default function normalizeImageUrl(imageUrl?: string | null) {
  if (!imageUrl) {
    return null
  }

  if (!BACKEND_URL) {
    return imageUrl
  }

  try {
    if (imageUrl.startsWith("/")) {
      return new URL(imageUrl, BACKEND_URL).toString()
    }

    const parsedImageUrl = new URL(imageUrl)

    if (!LOCAL_HOSTS.has(parsedImageUrl.hostname)) {
      return imageUrl
    }

    const backend = new URL(BACKEND_URL)

    return new URL(
      `${parsedImageUrl.pathname}${parsedImageUrl.search}${parsedImageUrl.hash}`,
      backend
    ).toString()
  } catch {
    return imageUrl
  }
}

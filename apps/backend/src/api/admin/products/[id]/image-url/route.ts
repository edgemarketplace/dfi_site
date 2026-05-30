import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params // Product ID
  const body = (req as any).body as { url: string }
  
  if (!body.url) {
    return res.status(400).json({ message: "URL is required" })
  }

  const productModuleService = req.scope.resolve(Modules.PRODUCT)
  const fileModuleService = req.scope.resolve(Modules.FILE)

  try {
    // 1. Fetch image from URL
    const imageResponse = await fetch(body.url)
    if (!imageResponse.ok) {
      return res.status(400).json({ message: "Failed to download image from URL" })
    }

    const arrayBuffer = await imageResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Determine content type and extension
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg"
    const extension = contentType.split("/")[1] || "jpg"
    const filename = `product-${id}-${Date.now()}.${extension}`

    // 2. Upload using File Module
    const uploadResult = await fileModuleService.createFiles({
      filename,
      mime_type: contentType,
      content: buffer.toString("base64"), // Medusa v2 expects base64 or a stream sometimes, or you can just pass the external URL directly to images if we don't upload it. But it's safer to upload it to our own storage.
    })

    const fileUrl = uploadResult.url

    // 3. Update Product
    const product = await productModuleService.retrieveProduct(id, {
      relations: ["images"],
    })

    const existingImages = product.images.map((img) => ({ url: img.url }))
    existingImages.push({ url: fileUrl })

    await productModuleService.updateProducts({
      id,
      images: existingImages,
    })

    return res.status(200).json({ message: "Image added successfully", url: fileUrl })
  } catch (error: any) {
    console.error("Error adding image by URL:", error)
    return res.status(500).json({ message: error.message || "Internal server error" })
  }
}

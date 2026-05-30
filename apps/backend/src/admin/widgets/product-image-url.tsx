import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Input, Button, toast } from "@medusajs/ui"
import { useState } from "react"
import { sdk } from "../lib/sdk" // Assuming sdk might exist or we use standard fetch

const ProductImageWidget = ({ product }: { product: any }) => {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAddImage = async () => {
    if (!url) return

    setIsLoading(true)
    try {
      const response = await fetch(`/admin/products/${product.id}/image-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to add image")
      }

      toast.success("Success", {
        description: "Image added successfully by URL. Refresh to see changes.",
      })
      setUrl("")
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container className="p-6 gap-y-4 flex flex-col">
      <Heading level="h2">Add Media by URL</Heading>
      <div className="flex gap-x-2">
        <Input 
          placeholder="https://example.com/image.jpg" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
        />
        <Button 
          variant="secondary" 
          onClick={handleAddImage} 
          isLoading={isLoading}
        >
          Add Image
        </Button>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductImageWidget

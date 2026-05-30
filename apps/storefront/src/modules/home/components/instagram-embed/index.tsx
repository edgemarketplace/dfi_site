"use client"

import { useEffect } from "react"

const InstagramEmbed = () => {
  useEffect(() => {
    // Load Instagram embed script
    const script = document.createElement("script")
    script.src = "//www.instagram.com/embed.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-12 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Follow Us on Instagram</h2>
      <div className="w-full max-w-2xl overflow-hidden rounded-lg shadow-sm border border-gray-200">
        {/* Replace the blockquote data-instgrm-permalink with your actual post or feed widget */}
        <blockquote
          className="instagram-media"
          data-instgrm-permalink="https://www.instagram.com/p/C-h9z01O8tZ/?utm_source=ig_embed&amp;utm_campaign=loading"
          data-instgrm-version="14"
          style={{
            background: "#FFF",
            border: "0",
            borderRadius: "3px",
            boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
            margin: "1px",
            maxWidth: "540px",
            minWidth: "326px",
            padding: "0",
            width: "calc(100% - 2px)",
          }}
        >
          <div style={{ padding: "16px" }}>
            <a
              href="https://www.instagram.com/p/C-h9z01O8tZ/?utm_source=ig_embed&amp;utm_campaign=loading"
              style={{
                background: "#FFFFFF",
                lineHeight: "0",
                padding: "0 0",
                textAlign: "center",
                textDecoration: "none",
                width: "100%",
              }}
              target="_blank"
              rel="noreferrer"
            >
              Loading Instagram Post...
            </a>
          </div>
        </blockquote>
      </div>
      <p className="mt-4 text-sm text-gray-500">
        To show your own feed, replace the embed code in <code className="bg-gray-200 px-1 rounded">src/modules/home/components/instagram-embed/index.tsx</code> with your preferred Instagram widget (e.g., Elfsight) or your own post URL.
      </p>
    </div>
  )
}

export default InstagramEmbed

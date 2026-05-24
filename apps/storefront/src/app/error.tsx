'use client'

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-white text-black p-4 text-center">
      <h2 className="text-xl font-semibold">Something went wrong!</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-black text-white rounded text-sm font-medium"
      >
        Try again
      </button>
    </div>
  )
}

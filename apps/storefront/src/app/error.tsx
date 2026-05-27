'use client'

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-white text-black p-4 text-center">
          <h1 className="text-2xl font-semibold">500 - Server Error</h1>
          <p className="text-sm text-gray-600">An unexpected error occurred during processing.</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-black text-white rounded text-sm font-medium transition-colors hover:bg-gray-800"
          >
            Retry Connection
          </button>
        </div>
      </body>
    </html>
  )
}

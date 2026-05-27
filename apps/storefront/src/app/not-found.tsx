import Link from "next/link"

export const dynamic = "force-dynamic"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4 text-center">
      <h1 className="text-2xl font-semibold">404 - Page Not Found</h1>
      <p className="text-sm text-gray-600">The requested resource could not be found.</p>
      <Link className="text-sm font-medium text-blue-600 hover:underline mt-2 inline-block" href="/">
        Go back to storefront
      </Link>
    </div>
  )
}

import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-white text-black p-4 text-center">
      <h1 className="text-2xl font-semibold">404 - Page Not Found</h1>
      <p className="text-sm text-gray-600">The page you are looking for does not exist.</p>
      <Link className="text-sm font-medium text-blue-600 hover:underline" href="/">
        Return Home
      </Link>
    </div>
  )
}

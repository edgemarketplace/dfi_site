import Link from "next/link"

// FORCE NEXT.JS TO BYPASS STATIC PRERENDERING FOR THIS ROUTE:
export const dynamic = "force-dynamic"

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)] bg-white text-black">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-gray-600">The page you tried to access does not exist.</p>
      <Link className="text-sm font-medium text-blue-600 hover:underline" href="/">
        Go to frontpage
      </Link>
    </div>
  )
}

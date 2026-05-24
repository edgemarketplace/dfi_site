import { ArrowUpRightMini } from "@medusajs/icons"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)] bg-white text-black">
      <h1 className="text-2xl font-semibold text-gray-900">Page not found</h1>
      <p className="text-sm font-normal text-gray-600">
        The page you tried to access does not exist.
      </p>
      <Link className="flex gap-x-1 items-center group text-blue-600 hover:text-blue-800" href="/">
        <span className="text-sm font-medium">Go to frontpage</span>
        <ArrowUpRightMini
          className="group-hover:rotate-45 ease-in-out duration-150 w-4 h-4"
        />
      </Link>
    </div>
  )
}

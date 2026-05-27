"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"

/**
 * Use this component to create a Next.js `<Link />` that persists the current country code in the url,
 * without having to explicitly pass it as a prop.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  passHref?: true
  [x: string]: unknown
}) => {
  const params = useParams() ?? {}
  const rawCc = params.countryCode
  const countryCode = Array.isArray(rawCc) ? rawCc[0] : (typeof rawCc === 'string' ? rawCc : '')
  const localizedHref = countryCode ? `/${countryCode}${href}` : href

  return (
    <Link href={localizedHref} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink

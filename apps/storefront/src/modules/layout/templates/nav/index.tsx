import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

async function CategoryNav() {
  let categories: { id: string; name: string; handle: string }[] = []
  try {
    const cats = await listCategories({ limit: 50 })
    categories = cats
      .filter((c) => !c.parent_category)
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
      .map((c) => ({ id: c.id, name: c.name, handle: c.handle }))
  } catch (_e) {
    return null
  }

  if (!categories.length) return null

  return (
    <li className="relative group">
      <LocalizedClientLink
        className="hover:text-ui-fg-base flex items-center gap-1"
        href="/store"
        data-testid="nav-categories-link"
      >
        Categories
        <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </LocalizedClientLink>
      <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="bg-white rounded-xl shadow-xl border border-stone-100 py-2 min-w-[200px]">
          {categories.map((cat) => (
            <LocalizedClientLink
              key={cat.id}
              href={`/categories/${cat.handle}`}
              className="block px-4 py-2 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
            >
              {cat.name}
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </li>
  )
}

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group bg-white">
      <div className="bg-stone-950 text-white">
        <div className="content-container flex h-10 items-center justify-center text-center text-[11px] font-medium uppercase tracking-[0.18em] small:justify-between">
          <span className="hidden small:inline">Welcome to Defend Freedom Industries</span>
          <span>Custom team stores and apparel drops available now</span>
          <a
            href="mailto:defendfreedomindustries@gmail.com"
            className="hidden underline underline-offset-4 small:inline"
          >
            Contact Us
          </a>
        </div>
      </div>
      <header className="relative h-20 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus hover:text-amber-600 uppercase tracking-[0.22em]"
              data-testid="nav-store-link"
            >
              Defend Freedom Industries
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <Suspense fallback={null}>
                <CategoryNav />
              </Suspense>
              <LocalizedClientLink
                className="hover:text-ui-fg-base"
                href="/store"
                data-testid="nav-storefront-link"
              >
                Shop All
              </LocalizedClientLink>
              <LocalizedClientLink
                className="hover:text-ui-fg-base"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}

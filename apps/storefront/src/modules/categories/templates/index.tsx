import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  return (
    <div className="flex flex-col small:flex-row small:items-start py-6 content-container">
      <RefinementList sortBy={sort} data-testid="sort-by-container" />
      <div className="w-full">
        {/* Breadcrumb */}
        <div className="flex flex-row mb-4 text-sm gap-2 text-ui-fg-subtle">
          <LocalizedClientLink href="/store" className="hover:text-amber-600">
            Shop All
          </LocalizedClientLink>
          <span>/</span>
          {parents &&
            parents.map((parent) => (
              <span key={parent.id} className="text-ui-fg-subtle">
                <LocalizedClientLink
                  className="hover:text-amber-600 mr-2"
                  href={`/categories/${parent.handle}`}
                >
                  {parent.name}
                </LocalizedClientLink>
                <span>/</span>
              </span>
            ))}
          <span className="text-stone-900 font-medium">{category.name}</span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-stone-900 mb-2" data-testid="category-page-title">
          {category.name}
        </h1>

        {category.description && (
          <div className="mb-8 text-base-regular text-stone-600">
            <p>{category.description}</p>
          </div>
        )}

        {/* Child categories */}
        {category.category_children && category.category_children.length > 0 && (
          <div className="mb-8">
            <ul className="flex flex-wrap gap-2">
              {category.category_children?.map((c) => (
                <li key={c.id}>
                  <InteractiveLink href={`/categories/${c.handle}`}>
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-stone-100 text-sm font-medium text-stone-700 hover:bg-amber-100 hover:text-amber-800 transition-colors">
                      {c.name}
                    </span>
                  </InteractiveLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}

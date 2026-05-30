import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { listCategories } from "@lib/data/categories"

const servicePromises = [
  {
    title: "Custom Team Stores",
    copy: "Dedicated apparel drops for departments, teams, academies, and local brands.",
    icon: (
      <svg className="w-8 h-8 text-amber-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    )
  },
  {
    title: "Duty-Ready Quality",
    copy: "Comfortable pieces designed for long shifts, community events, and everyday wear.",
    icon: (
      <svg className="w-8 h-8 text-amber-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    title: "Personal Support",
    copy: "Work directly with DFI for sizing, artwork, fulfillment, and custom order questions.",
    icon: (
      <svg className="w-8 h-8 text-amber-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },
]

const Hero = async () => {
  let categories: { id: string; name: string; handle: string }[] = []
  try {
    const cats = await listCategories({ limit: 20 })
    categories = cats
      .filter((c) => !c.parent_category)
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
      .map((c) => ({ id: c.id, name: c.name, handle: c.handle }))
  } catch (_e) {
    console.warn("Hero: failed to load categories")
  }

  return (
    <div className="bg-stone-50 text-stone-900 min-h-screen font-sans selection:bg-amber-500/30 selection:text-stone-900">
      {/* Shop By Category — horizontal strip above hero */}
      {categories.length > 0 && (
        <section className="content-container pt-6 pb-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600 shrink-0">
              Shop By Category
            </span>
            <div className="h-px flex-1 bg-stone-200" />
            {categories.map((category) => (
              <LocalizedClientLink
                key={category.id}
                href={`/categories/${category.handle}`}
                className="shrink-0 inline-flex items-center px-4 py-2 rounded-full border border-stone-200 text-xs font-bold uppercase tracking-wider text-stone-700 hover:border-amber-500 hover:text-amber-700 transition-all duration-200 whitespace-nowrap"
              >
                {category.name}
              </LocalizedClientLink>
            ))}
          </div>
        </section>
      )}

      {/* Hero Banner Section */}
      <section className="content-container pb-8 small:pb-12">
        <div className="relative min-h-[80vh] overflow-hidden rounded-[2.5rem] bg-stone-950 shadow-2xl group/hero">
          <img
            src="https://www.defendfreedomindustries.com/web/image/4778-12d826bd/IMG_8622.webp"
            alt="Defend Freedom Industries custom apparel"
            className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-1000 ease-out scale-100 group-hover/hero:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent" />
          
          <div className="relative z-10 flex min-h-[80vh] max-w-3xl flex-col justify-center px-8 py-20 text-white small:px-20">
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.45em] text-amber-500 animate-pulse">
              Modern Custom Apparel
            </p>
            <h1 className="text-5xl font-black leading-none tracking-tight small:text-7.5xl text-stone-50">
              Built For Those
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">
                Who Serve
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-stone-300 small:text-lg">
              Premium gear for first responders, military personnel, teams, and community organizations — built to represent the people who show up.
            </p>
            <div className="mt-12 flex flex-col gap-4 small:flex-row">
              <LocalizedClientLink
                href="/store"
                className="inline-flex h-13 items-center justify-center rounded-full bg-amber-500 px-10 text-sm font-bold uppercase tracking-widest text-stone-950 hover:bg-amber-400 active:scale-98 transition-all duration-300 shadow-lg shadow-amber-500/20"
              >
                Shop Collection
              </LocalizedClientLink>
              <a
                href="mailto:defendfreedomindustries@gmail.com"
                className="inline-flex h-13 items-center justify-center rounded-full border-2 border-white/30 backdrop-blur-sm px-10 text-sm font-bold uppercase tracking-widest text-white hover:border-white hover:bg-white/10 active:scale-98 transition-all duration-300"
              >
                Custom Orders
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights / Collections Grid */}
      <section className="content-container grid gap-8 py-10 small:grid-cols-2 small:py-16">
        <LocalizedClientLink
          href="/categories/hfdonduty"
          className="group relative min-h-[460px] overflow-hidden rounded-[2rem] bg-stone-950 shadow-xl"
        >
          <img
            src="https://www.defendfreedomindustries.com/web/image/4775-2a9997c1/15047.webp"
            alt="Henderson Fire apparel"
            className="absolute inset-0 h-full w-full object-cover opacity-75 transition-transform duration-700 scale-100 group-hover:scale-103"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-center text-white flex flex-col items-center">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-500 mb-2">
              Department Apparel
            </p>
            <h3 className="text-3xl font-black tracking-tight small:text-4xl text-stone-100">On-Duty Essentials</h3>
            <span className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-white px-8 text-xs font-bold uppercase tracking-widest text-stone-950 hover:bg-amber-500 hover:text-stone-950 hover:shadow-lg transition-all duration-300">
              Shop Now
            </span>
          </div>
        </LocalizedClientLink>

        <LocalizedClientLink
          href="/categories/stars"
          className="group relative min-h-[460px] overflow-hidden rounded-[2rem] bg-stone-950 shadow-xl"
        >
          <img
            src="https://www.defendfreedomindustries.com/unsplash/aMuXhFkbxEw/4796/baseball.jpg?unique=5b1288a4"
            alt="Team apparel"
            className="absolute inset-0 h-full w-full object-cover opacity-75 transition-transform duration-700 scale-100 group-hover:scale-103"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-center text-white flex flex-col items-center">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-500 mb-2">
              Team Collections
            </p>
            <h3 className="text-3xl font-black tracking-tight small:text-4xl text-stone-100">Confident Looks</h3>
            <span className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-white px-8 text-xs font-bold uppercase tracking-widest text-stone-950 hover:bg-amber-500 hover:text-stone-950 hover:shadow-lg transition-all duration-300">
              Shop Now
            </span>
          </div>
        </LocalizedClientLink>
      </section>

      {/* Service Promises Cards Grid */}
      <section className="content-container py-16 small:py-24">
        <div className="grid gap-8 small:grid-cols-3 max-w-6xl mx-auto">
          {servicePromises.map((promise) => (
            <div 
              key={promise.title}
              className="flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-stone-100 hover:border-amber-500/20 hover:shadow-xl transition-all duration-300"
            >
              {promise.icon}
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600">
                DFI Standard
              </p>
              <h3 className="mt-3 text-xl font-black tracking-tight text-stone-900">{promise.title}</h3>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-500">
                {promise.copy}
              </p>
              <LocalizedClientLink
                href="/store"
                className="mt-6 inline-flex items-center text-xs font-bold uppercase tracking-wider text-amber-600 hover:text-amber-500 group-hover:underline underline-offset-4"
              >
                <span>Shop Collection</span>
                <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </LocalizedClientLink>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Philosophy Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 py-24 text-center text-white small:py-32 shadow-inner">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-600/5 blur-[100px] pointer-events-none" />
        
        <div className="content-container relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.45em] text-amber-500 mb-5">
            Our Philosophy
          </p>
          <h2 className="mx-auto max-w-5xl text-4xl font-black leading-tight tracking-tight small:text-6xl text-stone-50">
            We believe the uniform doesn&apos;t come off when the shift ends.
          </h2>
          <div className="h-1.5 w-16 bg-amber-500 mx-auto rounded-full my-8" />
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-stone-300">
            Every stitch honors courage, sacrifice, and commitment — on duty, off duty, and in the community.
          </p>
          <div className="mt-12 flex flex-col justify-center items-center gap-4 small:flex-row">
            <LocalizedClientLink
              href="/store"
              className="inline-flex h-13 items-center justify-center rounded-full bg-amber-500 px-10 text-sm font-bold uppercase tracking-widest text-stone-950 hover:bg-amber-400 transition-all duration-300 shadow-lg shadow-amber-500/20 w-full small:w-auto"
            >
              New Arrivals
            </LocalizedClientLink>
            <a
              href="mailto:defendfreedomindustries@gmail.com"
              className="inline-flex h-13 items-center justify-center rounded-full border-2 border-white/20 px-10 text-sm font-bold uppercase tracking-widest text-white hover:bg-white hover:text-stone-950 hover:border-white transition-all duration-300 w-full small:w-auto"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Hero

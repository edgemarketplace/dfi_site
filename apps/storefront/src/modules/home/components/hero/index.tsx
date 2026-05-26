import LocalizedClientLink from "@modules/common/components/localized-client-link"

const clientCategories = [
  {
    name: "Fire Department",
    image: "https://www.defendfreedomindustries.com/web/image/4775-2a9997c1/15047.webp",
  },
  {
    name: "Off-Duty Gear",
    image: "https://www.defendfreedomindustries.com/web/image/4778-12d826bd/IMG_8622.webp",
  },
  {
    name: "Explorers",
    image: "https://www.defendfreedomindustries.com/web/image/4797-2e96479d/18520.webp",
  },
  {
    name: "Baseball Teams",
    image: "https://www.defendfreedomindustries.com/unsplash/FobzAZJGM9M/4780/baseball.jpg?unique=880e8d1d",
  },
  {
    name: "Academy Apparel",
    image: "https://www.defendfreedomindustries.com/web/image/4781-d08defc5/S%20Logo.webp",
  },
]

const servicePromises = [
  {
    title: "Custom Team Stores",
    copy: "Dedicated apparel drops for departments, teams, academies, and local brands.",
  },
  {
    title: "Duty-Ready Quality",
    copy: "Comfortable pieces designed for long shifts, community events, and everyday wear.",
  },
  {
    title: "Personal Support",
    copy: "Work directly with DFI for sizing, artwork, fulfillment, and custom order questions.",
  },
]

const Hero = () => {
  return (
    <div className="bg-white text-stone-950">
      <section className="content-container py-6 small:py-10">
        <div className="relative min-h-[74vh] overflow-hidden rounded-[2rem] bg-stone-950">
          <img
            src="https://www.defendfreedomindustries.com/web/image/4778-12d826bd/IMG_8622.webp"
            alt="Defend Freedom Industries custom apparel"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
          <div className="relative z-10 flex min-h-[74vh] max-w-3xl flex-col justify-center px-6 py-16 text-white small:px-16">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.42em] text-white/80">
              Modern custom apparel
            </p>
            <h1 className="text-5xl font-black leading-none tracking-tight small:text-7xl">
              Built for those who serve
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/85 small:text-lg">
              Premium gear for first responders, military personnel, teams, and community organizations — built to represent the people who show up.
            </p>
            <div className="mt-10 flex flex-col gap-3 small:flex-row">
              <LocalizedClientLink
                href="/store"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-bold uppercase tracking-widest text-stone-950 transition hover:bg-stone-100"
              >
                Shop Collection
              </LocalizedClientLink>
              <a
                href="mailto:defendfreedomindustries@gmail.com"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/50 px-8 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-stone-950"
              >
                Custom Orders
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="content-container py-14 text-center small:py-20">
        <p className="mx-auto max-w-2xl text-sm leading-6 text-stone-500">
          Express your organization’s identity with standout apparel — clean design, reliable comfort, and a refined retail experience.
        </p>
        <h2 className="mt-4 text-3xl font-black tracking-tight small:text-4xl">
          Shop By Category
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-5 small:grid-cols-5">
          {clientCategories.map((category) => (
            <LocalizedClientLink href="/store" key={category.name} className="group block">
              <div className="aspect-square overflow-hidden rounded-full bg-stone-100">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <p className="mt-4 text-sm font-bold uppercase tracking-wide text-stone-900 group-hover:underline">
                {category.name}
              </p>
            </LocalizedClientLink>
          ))}
        </div>
      </section>

      <section className="content-container grid gap-6 py-8 small:grid-cols-2 small:py-12">
        <LocalizedClientLink
          href="/store"
          className="group relative min-h-[420px] overflow-hidden rounded-[1.5rem] bg-stone-900"
        >
          <img
            src="https://www.defendfreedomindustries.com/web/image/4775-2a9997c1/15047.webp"
            alt="Henderson Fire apparel"
            className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-center text-white">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-white/80">
              Department apparel
            </p>
            <h3 className="mt-3 text-4xl font-black tracking-tight">On-Duty Essentials</h3>
            <span className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-white px-7 text-sm font-bold uppercase tracking-widest text-stone-950">
              Shop Now
            </span>
          </div>
        </LocalizedClientLink>

        <LocalizedClientLink
          href="/store"
          className="group relative min-h-[420px] overflow-hidden rounded-[1.5rem] bg-stone-900"
        >
          <img
            src="https://www.defendfreedomindustries.com/unsplash/aMuXhFkbxEw/4796/baseball.jpg?unique=5b1288a4"
            alt="Team apparel"
            className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 p-8 text-center text-white">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-white/80">
              Team collections
            </p>
            <h3 className="mt-3 text-4xl font-black tracking-tight">Confident Looks</h3>
            <span className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-white px-7 text-sm font-bold uppercase tracking-widest text-stone-950">
              Shop Now
            </span>
          </div>
        </LocalizedClientLink>
      </section>

      <section className="content-container grid gap-10 py-16 text-center small:grid-cols-3 small:py-24">
        {servicePromises.map((promise) => (
          <div key={promise.title}>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-stone-400">
              DFI Standard
            </p>
            <h3 className="mt-3 text-2xl font-black tracking-tight">{promise.title}</h3>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-stone-500">
              {promise.copy}
            </p>
            <LocalizedClientLink
              href="/store"
              className="mt-5 inline-block text-sm font-bold underline underline-offset-4"
            >
              Shop Collection
            </LocalizedClientLink>
          </div>
        ))}
      </section>

      <section className="bg-stone-500 py-20 text-center text-white small:py-28">
        <div className="content-container">
          <p className="text-xs font-bold uppercase tracking-[0.42em] text-white/70">
            Our Philosophy
          </p>
          <h2 className="mx-auto mt-5 max-w-5xl text-4xl font-black leading-tight tracking-tight small:text-6xl">
            We believe the uniform doesn’t come off when the shift ends.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/80">
            Every stitch honors courage, sacrifice, and commitment — on duty, off duty, and in the community.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 small:flex-row">
            <a
              href="mailto:defendfreedomindustries@gmail.com"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/60 px-8 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-stone-700"
            >
              Contact Us
            </a>
            <LocalizedClientLink
              href="/store"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-bold uppercase tracking-widest text-stone-700 transition hover:bg-stone-100"
            >
              New Arrivals
            </LocalizedClientLink>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Hero

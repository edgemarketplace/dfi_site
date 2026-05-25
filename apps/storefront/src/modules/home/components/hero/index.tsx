import LocalizedClientLink from "@modules/common/components/localized-client-link"

const clients = [
  {
    name: "Henderson Fire On-Duty",
    image: "https://www.defendfreedomindustries.com/web/image/4775-2a9997c1/15047.webp",
  },
  {
    name: "Henderson Fire Off-Duty",
    image: "https://www.defendfreedomindustries.com/web/image/4778-12d826bd/IMG_8622.webp",
  },
  {
    name: "Henderson Fire Explorers",
    image: "https://www.defendfreedomindustries.com/web/image/4797-2e96479d/18520.webp",
  },
  {
    name: "STARS Baseball",
    image: "https://www.defendfreedomindustries.com/unsplash/FobzAZJGM9M/4780/baseball.jpg?unique=880e8d1d",
  },
  {
    name: "GBA Baseball",
    image: "https://www.defendfreedomindustries.com/unsplash/aMuXhFkbxEw/4796/baseball.jpg?unique=5b1288a4",
  },
  {
    name: "Nevada Sports Academy",
    image: "https://www.defendfreedomindustries.com/web/image/4781-d08defc5/S%20Logo.webp",
  },
  {
    name: "Flow IV",
    image: "https://www.defendfreedomindustries.com/web/image/4783-264997ed/82A4296C-8250-42F3-B4CE-140C27B85E24.webp",
  },
]

const Hero = () => {
  return (
    <div className="bg-stone-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(180,83,9,0.28),_transparent_34%),linear-gradient(135deg,_rgba(0,0,0,0.95),_rgba(28,25,23,0.88))]" />
        <div className="content-container relative z-10 flex min-h-[72vh] flex-col justify-center py-24 small:py-32">
          <div className="max-w-4xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.45em] text-amber-400">
              Welcome to
            </p>
            <h1 className="text-5xl font-black uppercase leading-none tracking-tight small:text-7xl">
              Defend Freedom Industries
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-200">
              Custom apparel built to represent the courage, sacrifice, and unwavering commitment of first responders, military personnel, teams, and community organizations.
            </p>
            <div className="mt-10 flex flex-col gap-3 small:flex-row">
              <LocalizedClientLink
                href="/store"
                className="inline-flex h-12 items-center justify-center rounded-full bg-amber-500 px-8 text-sm font-bold uppercase tracking-widest text-stone-950 transition hover:bg-amber-400"
              >
                Shop Gear
              </LocalizedClientLink>
              <a
                href="mailto:defendfreedomindustries@gmail.com"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-8 text-sm font-bold uppercase tracking-widest text-white transition hover:border-amber-400 hover:text-amber-300"
              >
                Start a Custom Order
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="content-container py-16 small:py-24">
        <div className="mb-10 flex flex-col justify-between gap-4 small:flex-row small:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">
              Our Clients
            </p>
            <h2 className="mt-3 text-3xl font-bold uppercase tracking-tight text-white small:text-4xl">
              Trusted by teams, agencies, and local brands
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-stone-300">
            From fire departments to baseball programs and wellness brands, DFI creates apparel people are proud to wear on and off duty.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 small:grid-cols-2 large:grid-cols-4">
          {clients.map((client) => (
            <LocalizedClientLink
              href="/store"
              key={client.name}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-amber-400/70"
            >
              <div className="aspect-[4/3] overflow-hidden bg-stone-900">
                <img
                  src={client.image}
                  alt={client.name}
                  className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                  loading="lazy"
                />
              </div>
              <div className="flex min-h-20 items-center justify-between gap-4 p-5">
                <h3 className="text-base font-bold uppercase tracking-wide text-white">
                  {client.name}
                </h3>
                <span className="text-amber-400 transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Hero

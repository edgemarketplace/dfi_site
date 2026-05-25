import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text } from "@modules/common/components/ui"

const companyLinks = [
  { label: "About Us", href: "/" },
  { label: "Contact Us", href: "mailto:defendfreedomindustries@gmail.com" },
  { label: "Shop", href: "/store" },
  { label: "Account", href: "/account" },
  { label: "Cart", href: "/cart" },
]

const quickLinks = [
  { label: "Fire Department Gear", href: "/store" },
  { label: "Team Apparel", href: "/store" },
  { label: "Custom Orders", href: "mailto:defendfreedomindustries@gmail.com" },
  { label: "Privacy Policy", href: "/" },
]

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const className = "text-sm text-stone-600 transition hover:text-stone-950"

  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }

  return (
    <LocalizedClientLink href={href} className={className}>
      {children}
    </LocalizedClientLink>
  )
}

export default async function Footer() {
  return (
    <footer className="bg-stone-100 text-stone-950">
      <div className="content-container py-16 small:py-24">
        <div className="grid gap-12 large:grid-cols-[1.1fr_0.7fr_0.7fr_1fr]">
          <div>
            <LocalizedClientLink
              href="/"
              className="text-2xl font-black uppercase tracking-tight text-stone-950"
            >
              Defend Freedom Industries
            </LocalizedClientLink>
            <p className="mt-5 max-w-sm text-sm leading-7 text-stone-600">
              Premium custom apparel for first responders, military personnel, teams, academies, and local brands.
            </p>
            <div className="mt-6 space-y-2 text-sm text-stone-600">
              <p>United States</p>
              <a href="tel:+19283026668" className="block hover:text-stone-950">
                +1 (928) 302-6668
              </a>
              <a
                href="mailto:defendfreedomindustries@gmail.com"
                className="block hover:text-stone-950"
              >
                defendfreedomindustries@gmail.com
              </a>
            </div>
          </div>

          <div>
            <h5 className="mb-5 text-sm font-black uppercase tracking-[0.2em]">
              Our Company
            </h5>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="mb-5 text-sm font-black uppercase tracking-[0.2em]">
              Quick Links
            </h5>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="mb-5 text-sm font-black uppercase tracking-[0.2em]">
              Sign Up to Newsletter
            </h5>
            <p className="text-sm leading-7 text-stone-600">
              Get updates on new apparel drops, team stores, and custom order availability.
            </p>
            <form className="mt-6 flex overflow-hidden rounded-full border border-stone-300 bg-white p-1">
              <input
                type="email"
                placeholder="Email address"
                className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-stone-400"
              />
              <button
                type="button"
                className="rounded-full bg-stone-950 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-stone-700"
              >
                Sign Up
              </button>
            </form>
            <p className="mt-4 text-xs leading-5 text-stone-500">
              By signing up, you agree to receive DFI updates. No spam — just relevant releases and custom shop news.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-stone-300 pt-8 small:flex-row small:items-center small:justify-between">
          <Text className="txt-compact-small text-stone-500">
            © {new Date().getFullYear()} Defend Freedom Industries. All rights reserved.
          </Text>
          <div className="flex gap-2 text-xs font-bold uppercase tracking-widest text-stone-500">
            <span className="rounded bg-white px-2 py-1">Visa</span>
            <span className="rounded bg-white px-2 py-1">Mastercard</span>
            <span className="rounded bg-white px-2 py-1">Amex</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

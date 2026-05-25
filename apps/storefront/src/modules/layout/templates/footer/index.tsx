import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text } from "@modules/common/components/ui"

const usefulLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/store" },
  { label: "Account", href: "/account" },
  { label: "Cart", href: "/cart" },
]

export default async function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-950 text-white">
      <div className="content-container flex flex-col w-full">
        <div className="grid gap-12 py-16 small:py-24 large:grid-cols-[1.2fr_0.8fr_1fr]">
          <div>
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus uppercase tracking-[0.25em] text-white hover:text-amber-300"
            >
              Defend Freedom Industries
            </LocalizedClientLink>
            <p className="mt-5 max-w-md text-sm leading-7 text-stone-300">
              Apparel and custom gear honoring the men and women who put everything on the line to keep our communities safe and our nation free.
            </p>
          </div>

          <div>
            <h5 className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-amber-400">
              Useful Links
            </h5>
            <ul className="grid grid-cols-1 gap-3 text-sm text-stone-300">
              {usefulLinks.map((link) => (
                <li key={link.href}>
                  <LocalizedClientLink
                    href={link.href}
                    className="hover:text-amber-300"
                  >
                    {link.label}
                  </LocalizedClientLink>
                </li>
              ))}
              <li>
                <a
                  href="mailto:defendfreedomindustries@gmail.com"
                  className="hover:text-amber-300"
                >
                  Contact us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-amber-400">
              About us
            </h5>
            <div className="space-y-4 text-sm leading-7 text-stone-300">
              <p>
                At <strong className="text-white">DEFEND FREEDOM INDUSTRIES</strong>, we believe the uniform doesn’t come off when the shift ends.
              </p>
              <p>
                Every stitch represents courage, sacrifice, and commitment — on duty, off duty, and in the community.
              </p>
            </div>
            <div className="mt-6 space-y-2 text-sm text-stone-300">
              <h5 className="font-bold uppercase tracking-[0.25em] text-amber-400">
                Connect with us
              </h5>
              <a
                href="mailto:defendfreedomindustries@gmail.com"
                className="block hover:text-amber-300"
              >
                defendfreedomindustries@gmail.com
              </a>
              <a href="tel:+19283026668" className="block hover:text-amber-300">
                +1 (928) 302-6668
              </a>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 border-t border-white/10 py-8 text-stone-400 small:flex-row small:items-center small:justify-between">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} Defend Freedom Industries. All rights reserved.
          </Text>
          <Text className="txt-compact-small">
            Powered by Medusa commerce.
          </Text>
        </div>
      </div>
    </footer>
  )
}

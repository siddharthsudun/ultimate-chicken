import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-green-deep text-cream">
      {/* Incubation strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-x-10 gap-y-6 px-5 py-10 md:flex-row md:px-8">
          <p className="section-label shrink-0 !opacity-70 text-cream">Incubated by</p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-5">
            <div className="flex h-[68px] items-center rounded-xl bg-white px-5">
              <Image
                src="/brand/pieds-color.png"
                alt="PIEDS — Pilani Innovation and Entrepreneurship Development Society"
                width={661}
                height={377}
                className="h-11 w-auto"
              />
            </div>
            <div className="flex h-[68px] items-center rounded-xl bg-white px-5">
              <Image
                src="/brand/icar-nmri.png"
                alt="ICAR — National Meat Research Institute"
                width={960}
                height={240}
                className="h-9 w-auto"
              />
            </div>
            <div className="flex h-[68px] items-center rounded-xl bg-white px-5">
              <Image
                src="/brand/bits-white.png"
                alt="BITS Pilani"
                width={1200}
                height={1200}
                className="h-12 w-auto"
                style={{ filter: 'invert(1)' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <Image
            src="/brand/wordmark-green.png"
            alt="Ultimate Chicken"
            width={958}
            height={232}
            className="h-12 w-auto"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/60">
            India&apos;s first ready-to-eat sous vide chicken. Real food. Real protein. Built by two
            BITS Pilani students from a rented kitchen in Pilani.
          </p>
        </div>

        <div>
          <p className="section-label mb-4 text-cream">Product</p>
          <ul className="space-y-2.5 text-sm text-cream/70">
            <li><Link href="/flavours/korean-gochugaru" className="hover:text-lime-brand">Korean Gochugaru</Link></li>
            <li><Link href="/flavours/soy-chili-garlic" className="hover:text-lime-brand">Soy Chili Garlic</Link></li>
            <li><Link href="/flavours/peri-peri" className="hover:text-lime-brand">Peri-Peri</Link></li>
            <li><Link href="/why-sous-vide" className="hover:text-lime-brand">Why Sous Vide</Link></li>
            <li><Link href="/microplastics" className="hover:text-lime-brand">Microplastics Report</Link></li>
          </ul>
        </div>

        <div>
          <p className="section-label mb-4 text-cream">Company</p>
          <ul className="space-y-2.5 text-sm text-cream/70">
            <li><a href="https://instagram.com/ultimatechicken.in" target="_blank" rel="noopener noreferrer" className="hover:text-lime-brand">Instagram</a></li>
            <li><a href="mailto:siddharth@ultimatechicken.in" className="hover:text-lime-brand">Contact</a></li>
            <li>Ultimate Chicken Pvt Ltd</li>
            <li>Pilani, Rajasthan · Hyderabad</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center font-condensed text-sm uppercase tracking-widest text-cream/40">
        © {new Date().getFullYear()} Ultimate Chicken Private Limited · FSSAI Registered · Real Food. Real Protein.
      </div>
    </footer>
  )
}

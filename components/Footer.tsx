import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-green-deep text-cream">
      {/* Incubation strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 py-10 md:flex-row md:justify-between md:px-8">
          <p className="section-label !opacity-70 text-cream">Incubated by</p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            <Image
              src="/brand/pieds-white.png"
              alt="PIEDS — Pilani Innovation and Entrepreneurship Development Society"
              width={190}
              height={108}
              className="h-14 w-auto opacity-90"
            />
            <div className="rounded-lg bg-cream px-4 py-2">
              <Image
                src="/brand/icar-nmri.png"
                alt="ICAR — National Meat Research Institute"
                width={240}
                height={58}
                className="h-10 w-auto"
              />
            </div>
            <Image
              src="/brand/bits-white.png"
              alt="BITS Pilani"
              width={72}
              height={72}
              className="h-14 w-auto opacity-90"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <Image
            src="/brand/wordmark-green.png"
            alt="Ultimate Chicken"
            width={220}
            height={70}
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

"use client";

import Link from "next/link";
import { ArrowRight, Phone, Mail } from "lucide-react";

const FOOTER_LINKS = [
  { label: "How to Shop", href: "/man/panjabi-man" },
  { label: "Panjabi Collection", href: "/man/panjabi-man" },
  { label: "Shirts Collection", href: "/man/shirts-man" },
  { label: "Pants & Trousers", href: "/man/pant-man" },
  { label: "Delivery & Returns", href: "#" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Use", href: "#" },
  { label: "Cookies", href: "#" },
];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.6-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-neutral-950 text-white">
      {/* Main Footer */}
      <div className="px-6 md:px-12 py-14 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
            {/* Brand & Contact Column */}
            <div className="md:col-span-5 flex flex-col gap-5">
              <Link href="/" aria-label="ZFR home">
                <img src="/logoo.png" alt="ZFR" className="h-9 w-auto invert" />
              </Link>
              <p className="text-xs md:text-sm text-neutral-400 leading-relaxed max-w-sm">
                Contemporary high-fashion menswear. Tailored with distinction in Bangladesh, worn worldwide.
              </p>

              {/* Direct Contact Info */}
              <div className="space-y-2 text-xs text-neutral-300 pt-1">
                <a
                  href="mailto:zfr3611@gmail.com"
                  className="flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <span>zfr3611@gmail.com</span>
                </a>
                <a
                  href="tel:+8801616764344"
                  className="flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span>+880 1616-764344</span>
                </a>
              </div>

              {/* Official Social Media Links */}
              <div className="flex items-center gap-3 pt-2">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/zfr.official_?igsh=aHl3dmxrNDlhbXZv"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center text-neutral-300 hover:text-white hover:border-neutral-500 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/share/1BDhJYeRCu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center text-neutral-300 hover:text-white hover:border-neutral-500 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Official WhatsApp Button */}
                <a
                  href="https://wa.me/8801616764344"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#1EBE5A] text-white flex items-center justify-center transition-all duration-300 shadow-md active:scale-95"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                </a>

                {/* Official WhatsApp Text Link */}
                <a
                  href="https://wa.me/8801616764344"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 tracking-wider uppercase transition-colors ml-1"
                >
                  WhatsApp: +880 1616-764344
                </a>
              </div>
            </div>

            {/* Quick Links Column */}
            <div className="md:col-span-3 md:col-start-7">
              <h3 className="text-[11px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-5">
                Navigation
              </h3>
              <ul className="space-y-3">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-300 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="md:col-span-4">
              <h3 className="text-[11px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-5">
                Newsletter
              </h3>
              <p className="text-sm text-neutral-400 mb-4 leading-relaxed">
                Subscribe to ZFR for new drops, Panjabi releases, and exclusive offers.
              </p>
              <form
                className="flex items-center gap-0"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 bg-transparent border-b border-neutral-700 pb-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="pb-2.5 text-neutral-400 hover:text-white transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="px-6 md:px-12 py-5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-neutral-500 tracking-wide">
              &copy; {new Date().getFullYear()} ZFR Official. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <p className="text-[11px] text-neutral-500 tracking-wide">
              Dhaka, Bangladesh
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

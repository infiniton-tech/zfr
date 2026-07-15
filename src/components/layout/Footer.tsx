"use client";

import Link from "next/link";
import { Globe, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = {
  help: [
    { label: "HOW TO SHOP ONLINE", href: "#" },
    { label: "PAYMENT", href: "#" },
    { label: "DELIVERY", href: "#" },
    { label: "EXCHANGES AND RETURNS", href: "#" },
    { label: "SIZE GUIDE", href: "#" },
    { label: "E-TICKET", href: "#" },
  ],
  customerService: [
    { label: "STATUS OF YOUR ORDER", href: "#" },
    { label: "FIND YOUR RECEIPT", href: "#" },
    { label: "FREQUENTLY ASKED QUESTIONS", href: "#" },
    { label: "CONTACT", href: "#" },
  ],
  company: [
    { label: "ABOUT US", href: "#" },
    { label: "STORES", href: "#" },
    { label: "WORK WITH US", href: "#" },
  ],
  payment: [
    { label: "VISA", href: "#" },
    { label: "MASTERCARD", href: "#" },
    { label: "COD", href: "#" },
    { label: "AMEX", href: "#" },
  ],
  social: [
    { label: "INSTAGRAM", href: "#" },
    { label: "TIKTOK", href: "#" },
    { label: "FACEBOOK", href: "#" },
    { label: "X", href: "#" },
    { label: "PINTEREST", href: "#" },
    { label: "YOUTUBE", href: "#" },
    { label: "SPOTIFY", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-white border-t border-border">
      <div className="px-6 md:px-12 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Help */}
          <div>
            <h3 className="text-xs font-medium tracking-wider mb-4">HELP</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.help.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-xs font-medium tracking-wider mb-4">CUSTOMER SERVICE</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.customerService.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-medium tracking-wider mb-4">COMPANY</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-xs font-medium tracking-wider mb-4">PAYMENT METHODS</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.payment.map((link) => (
                <li key={link.label}>
                  <span className="text-xs text-muted-foreground">{link.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-xs font-medium tracking-wider mb-4">SOCIAL</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.social.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs font-medium tracking-wider mb-2">Newsletter :-)</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Subscribe to our newsletter and don&apos;t miss out on the latest news, access to exclusive promotions and much more!
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="E-mail"
                className="w-full text-xs border-b border-border pb-2 pr-8 bg-transparent focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
              />
              <button className="absolute right-0 bottom-2 hover:opacity-70" aria-label="Subscribe">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <Link href="#" className="text-xs text-muted-foreground underline mt-3 inline-block hover:text-foreground">
              Unsubscribe
            </Link>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom Bar */}
      <div className="px-6 md:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground tracking-wider">
          <Link href="#" className="hover:text-foreground transition-colors">PURCHASE CONDITIONS</Link>
          <Link href="#" className="hover:text-foreground transition-colors">PRIVACY POLICY</Link>
          <Link href="#" className="hover:text-foreground transition-colors">COOKIES POLICY</Link>
          <Link href="#" className="hover:text-foreground transition-colors">COOKIES SETTINGS</Link>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Globe className="w-3 h-3" />
          <span>BANGLADESH</span>
          <span className="mx-1">|</span>
          <span>ENGLISH</span>
        </div>
      </div>
    </footer>
  );
}

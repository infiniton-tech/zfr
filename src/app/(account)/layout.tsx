import Link from "next/link";

const ACCOUNT_NAV = [
  { label: "Profile", href: "/profile" },
  { label: "Orders", href: "/orders" },
  { label: "Addresses", href: "/addresses" },
  { label: "Wishlist", href: "/wishlist" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-[56px] min-h-screen bg-white">
      <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto">
        <h1 className="text-lg font-medium tracking-wide mb-8">MY ACCOUNT</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <nav className="space-y-1">
            {ACCOUNT_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-3 text-sm tracking-wide hover:bg-muted transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <button className="w-full text-left px-4 py-3 text-sm tracking-wide text-red-600 hover:bg-muted transition-colors">
              Log Out
            </button>
          </nav>
          {/* Content */}
          <div className="md:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

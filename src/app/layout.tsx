import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ZFR — Fashion for Everyone",
  description: "Discover the latest fashion trends at ZFR. Shop clothing, shoes, bags, and accessories for women, men, and kids.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider>{children}</SessionProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}

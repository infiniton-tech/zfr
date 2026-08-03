import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { BottomNav } from "@/components/layout/BottomNav";
import { SocialFloatingStack } from "@/components/shared/SocialFloatingStack";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ZFR — Premium Fashion",
  description: "Discover the latest fashion trends at ZFR. Shop clothing, shirts, pants, and Panjabis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased pb-[64px] md:pb-0" suppressHydrationWarning>
        <SessionProvider>
          {children}
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
          <Suspense fallback={null}>
            <SocialFloatingStack />
          </Suspense>
        </SessionProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}

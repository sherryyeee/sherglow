import type { Metadata, Viewport } from "next";
import { Geist, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["300", "400"],
  style: ["italic"],
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#F28BA8",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "SherGlow",
  description: "Your daily AI companion — news, insights, and growth",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SherGlow",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" className={`${geist.variable} ${cormorant.variable} h-full`}>
      <head>
        {/* 霞鹜文楷 GB Medium — loaded on demand via CDN, no local install needed */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-gb-web@latest/lxgwwenkaigb-medium/result.css"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: "#FFF8F6" }}>
        <main className="flex-1 pb-20 overflow-y-auto max-w-lg mx-auto w-full">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}

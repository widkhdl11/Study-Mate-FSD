import ReactQueryClientProvider from "@/shared/api/reactQuery/ReactQueryClientProvider";
import { Toaster } from "@/shared/shadcn/ui/sonner";
import type { Metadata } from "next";
import localFont from "next/font/local";
import type React from "react";
import "./globals.css";

const GeistSans = localFont({
  src: "../public/fonts/geist/geist-latin.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Study Mate - 함께 성장하는 스터디 문화",
  description:
    "스터디 모집 플랫폼 Study Mate에서 나에게 맞는 스터디를 찾고 함께 성장하세요.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${GeistSans.variable}`}>
      <head>
        <meta name="naver-site-verification" content="8699548ac724e7466db107bc0072bc6894628fac" />
      </head>
      <body className="antialiased font-sans">
        <ReactQueryClientProvider>
          {children}
          <Toaster />
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}

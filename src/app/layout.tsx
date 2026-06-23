import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { clientConfig } from "@/config/client";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: `${clientConfig.name} | ${clientConfig.tagline}`,
  description: clientConfig.description,
  keywords: [
    "interior design",
    "home construction",
    "modular kitchen",
    "AK Constructions",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen bg-white font-sans text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}

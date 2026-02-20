import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import SearchInput from "./components/SearchInput";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Noble Library",
  description: "A small collection of public domain books",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="w-full border-b border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
            <Link href="/" className="text-lg font-serif font-bold text-gray-900">
              Noble Library
            </Link>
            <div className="w-1/2">
              <SearchInput />
            </div>
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import SearchInput from "./components/SearchInput";
import AuthButton from "./components/AuthButton";
import Providers from "./providers";
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
  title: "Arcanon Library",
  description: "A small collection of public domain books",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <header className="w-full border-b border-gray-200 bg-white">
            <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
              <Link href="/" className="text-lg font-serif font-bold text-gray-900">
                Arcanon
              </Link>
              <div className="flex items-center gap-4 w-1/2">
                <div className="flex-1">
                  <SearchInput />
                </div>
                <div>
                  <AuthButton />
                </div>
              </div>
            </div>
          </header>

          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}

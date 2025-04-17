import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import Head from "next/head";
import "./globals.css";

// Load Inter from Google Fonts for body
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Load Geist Mono if used for code
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roamly | Where Remote Works",
  description:
    "Roamly helps you find remote-friendly cafes, coworking spaces & spots to crush your workflow.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        {/* Preload Satoshi via Bunny Fonts */}
        <link
          rel="preload"
          href="https://fonts.bunny.net/css?family=satoshi:400,500,700"
          as="style"
          onLoad={(e) => {
            const el = e.currentTarget as HTMLLinkElement;
            el.onload = null;
            el.rel = 'stylesheet';
          }}
        />

        <noscript>
         <link
            rel="stylesheet"
            href="https://fonts.bunny.net/css?family=satoshi:400,500,700"
          />
        </noscript>

      </Head>
      <body
        className={`${inter.variable} ${geistMono.variable} font-satoshi antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

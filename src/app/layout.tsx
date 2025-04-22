import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import Head from "next/head";
import "./globals.css";
import { LocationProvider } from '@/context/LocationContext';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NestleIn | Find Remote-Ready Work Spots",
  description:
    "Explore work-friendly cafes and coworking spaces near you with Wi-Fi, outlets, and chill vibes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
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
        className={`${inter.variable} ${geistMono.variable} font-satoshi antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <LocationProvider>
          {children}
          <footer className="mt-24 border-t border-[var(--border)] text-sm text-center text-[var(--text-secondary)] py-10">
            <p>Built for remote workers. © {new Date().getFullYear()} NestleIn</p>
          </footer>
        </LocationProvider>
      </body>
    </html>
  );
}

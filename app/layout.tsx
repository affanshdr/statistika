import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans, Caveat } from "next/font/google";
import "./globals.css";
import NetworkStatusBanner from "@/components/NetworkStatusBanner";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Skeptikos — Platform Game Edukasi Statistika",
  description: "Platform game edukasi statistika adaptif untuk SMA. Jadi detektif data, ungkap klaim viral menggunakan histogram, distribusi frekuensi, dan analisis kritis berbasis gaya kognitif FI/FD.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${outfit.variable} ${plusJakartaSans.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <NetworkStatusBanner />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0d0d12",
};

export const metadata: Metadata = {
  title: "umer — payments engineer in dubai",
  description:
    "senior software engineer working on multi-corridor african payments infrastructure. ledgers, reconciliation, event-driven systems. building cognifi, lumina, flux on the side.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "umer — payments engineer in dubai",
    description:
      "senior software engineer working on multi-corridor african payments infrastructure.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} h-full`}>
      <body className="h-full font-mono antialiased">{children}</body>
    </html>
  );
}

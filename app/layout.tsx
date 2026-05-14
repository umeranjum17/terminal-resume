import type { Metadata, Viewport } from "next";
import { defaultLocale, profile } from "@/content/profile";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  metadataBase: new URL(profile.websiteUrl),
  title: `${profile.name.toLowerCase()} — ${profile.role.toLowerCase()}, ${profile.location.toLowerCase()}`,
  description: `${profile.headline} ${profile.summary}`,
  authors: [{ name: profile.name, url: profile.websiteUrl }],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: `${profile.name.toLowerCase()} — ${profile.role.toLowerCase()}, ${profile.location.toLowerCase()}`,
    description: profile.headline,
    url: profile.websiteUrl,
    siteName: profile.website,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name.toLowerCase()} — ${profile.role.toLowerCase()}, ${profile.location.toLowerCase()}`,
    description: profile.headline,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={defaultLocale} dir={profile.direction} className="h-full">
      <body className="h-full font-mono antialiased overflow-hidden">{children}</body>
    </html>
  );
}

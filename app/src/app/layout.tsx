import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const DESC =
  "Premium pet products wholesale and retail: collars, harnesses, leashes, grooming, treats and accessories. Quality, care and trust. Bulk orders welcome, serving pet shops across India.";
// Production URL on Vercel; falls back to the live domain / localhost so share cards get absolute URLs.
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  applicationName: "Richi's PET Stuff",
  title: { default: "Richi's PET Stuff | Wholesale Pet Supplies", template: "%s | Richi's PET Stuff" },
  description: DESC,
  keywords: ["wholesale pet supplies", "dog collars", "dog harness", "pet leash", "rawhide chew sticks", "pet grooming", "pet shop supplier", "Pimpri Chinchwad", "Maharashtra"],
  openGraph: {
    type: "website",
    siteName: "Richi's PET Stuff",
    title: "Richi's PET Stuff | Wholesale Pet Supplies",
    description: DESC,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: "Richi's PET Stuff | Wholesale Pet Supplies", description: DESC },
  appleWebApp: { capable: true, title: "Richi's", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#0b0b0b", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}

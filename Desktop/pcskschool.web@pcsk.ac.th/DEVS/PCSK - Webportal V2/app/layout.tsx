import type { Metadata, Viewport } from "next";
import { Prompt, Sarabun } from "next/font/google";
import "./globals.css";
import { PORTAL_CONFIG } from "@/lib/constants";

const promptFont = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  display: "swap",
  variable: "--font-prompt",
});

const sarabunFont = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  display: "swap",
  variable: "--font-sarabun",
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${PORTAL_CONFIG.name}`,
    default: PORTAL_CONFIG.name,
  },
  description: `${PORTAL_CONFIG.schoolFullName} - ระบบพอร์ทัลกลางศูนย์รวมระบบสารสนเทศของโรงเรียน`,
  authors: [{ name: "Wachara Patkool" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#16a34a", // Tailwind Green-600
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${promptFont.variable} ${sarabunFont.variable}`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-800 selection:bg-green-100 selection:text-green-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}

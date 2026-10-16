import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ESG Almaty — город в данных",
  description: "Интерактивный мониторинг устойчивого развития Алматы: воздух, транспорт, районы и экологическое поведение.",
  openGraph: {
    title: "ESG Almaty — город в данных",
    description: "Воздух, транспорт, районы и экологическое поведение Алматы в одном интерактивном исследовании.",
    images: [{ url: "/og.png", width: 1730, height: 909, alt: "ESG Almaty — город в данных, будущее в фокусе" }],
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "ESG Almaty — город в данных", description: "Мониторинг устойчивого развития Алматы.", images: ["/og.png"] },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}

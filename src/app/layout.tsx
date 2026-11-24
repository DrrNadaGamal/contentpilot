import type { Metadata } from "next";
import "./globals.css";
import { getLocale } from "@/lib/locale-server";

export const metadata: Metadata = {
  title: "ContentPilot - Content automation with human approval",
  description:
    "Multi-channel content calendar, composer, approvals, media library and analytics. Demo build with seeded data.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body>{children}</body>
    </html>
  );
}

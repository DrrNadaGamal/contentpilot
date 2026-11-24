import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE } from "@/lib/i18n";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const locale = String(form.get("locale") ?? "en") === "ar" ? "ar" : "en";
  const back = req.headers.get("referer") ?? new URL("/", req.url).toString();
  const res = NextResponse.redirect(back, 303);
  res.cookies.set(LOCALE_COOKIE, locale, { path: "/", sameSite: "lax" });
  return res;
}

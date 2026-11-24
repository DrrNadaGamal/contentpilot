"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, PenSquare, CheckCircle2, Image as ImageIcon,
  BarChart3, Users, Settings, LogOut, Languages,
} from "lucide-react";
import { t, type Locale, type TKey } from "@/lib/i18n";
import { initials } from "@/lib/utils";

const NAV: { href: string; key: TKey; icon: React.ComponentType<{ size?: number }> }[] = [
  { href: "/", key: "nav_dashboard", icon: LayoutDashboard },
  { href: "/calendar", key: "nav_calendar", icon: CalendarDays },
  { href: "/composer", key: "nav_composer", icon: PenSquare },
  { href: "/approvals", key: "nav_approvals", icon: CheckCircle2 },
  { href: "/media", key: "nav_media", icon: ImageIcon },
  { href: "/analytics", key: "nav_analytics", icon: BarChart3 },
  { href: "/team", key: "nav_team", icon: Users },
  { href: "/settings", key: "nav_settings", icon: Settings },
];

export default function Sidebar({ locale, userName, userRole }: { locale: Locale; userName: string; userRole: string }) {
  const pathname = usePathname();
  return (
    <aside
      className="panel app-sidebar"
      style={{
        width: 240, margin: 16, marginInlineEnd: 0, padding: 14,
        display: "flex", flexDirection: "column", gap: 4, alignSelf: "flex-start",
        position: "sticky", top: 16, minHeight: "calc(100vh - 32px)",
      }}
    >
      <div className="app-brand" style={{ padding: "6px 10px 16px" }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>
          {t(locale, "appName")}<span style={{ color: "#6366f1" }}>.</span>
        </div>
        <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{t(locale, "tagline")}</div>
      </div>
      <nav className="app-nav" aria-label="Main">
      {NAV.map(({ href, key, icon: Icon }) => (
        <Link key={href} href={href} className={`navlink ${pathname === href ? "active" : ""}`}>
          <Icon size={17} />
          {t(locale, key)}
        </Link>
      ))}
      </nav>
      <div className="app-spacer" style={{ flex: 1 }} />
      <form className="app-locale" action="/api/locale" method="post" style={{ marginBottom: 6 }}>
        <input type="hidden" name="locale" value={locale === "ar" ? "en" : "ar"} />
        <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} type="submit">
          <Languages size={15} /> {locale === "ar" ? "English" : "العربية"}
        </button>
      </form>
      <div className="panel-2 app-user" style={{ padding: 10, display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34, height: 34, borderRadius: "50%", background: "#6366f1",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 13, flexShrink: 0,
          }}
        >
          {initials(userName)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
          <div className="muted" style={{ fontSize: 11 }}>{userRole}</div>
        </div>
        <form action="/api/logout" method="post" style={{ marginInlineStart: "auto" }}>
          <button className="btn btn-ghost" style={{ padding: 6 }} title={t(locale, "sign_out")} type="submit">
            <LogOut size={15} />
          </button>
        </form>
      </div>
    </aside>
  );
}

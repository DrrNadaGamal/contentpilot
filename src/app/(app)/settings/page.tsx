import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n";

export default async function SettingsPage() {
  const locale = await getLocale();
  const user = await currentUser();
  const ws = await prisma.workspace.findFirst({ include: { _count: { select: { brands: true, members: true, media: true } } } });
  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 0 }}>{t(locale, "nav_settings")}</h1>
      <p className="muted" style={{ fontSize: 13 }}>{t(locale, "settings_note")}</p>
      <div className="panel" style={{ padding: 18, marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700 }}>{t(locale, "language")}</div>
            <div className="muted" style={{ fontSize: 12 }}>English / العربية (RTL)</div>
          </div>
          <form action="/api/locale" method="post">
            <input type="hidden" name="locale" value={locale === "ar" ? "en" : "ar"} />
            <button className="btn btn-ghost" type="submit">{locale === "ar" ? "English" : "العربية"}</button>
          </form>
        </div>
        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
        <div>
          <div style={{ fontWeight: 700 }}>{t(locale, "workspace")}</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            {ws?.name} · {t(locale, "plan")} {ws?.plan} · {ws?._count.brands} brands · {ws?._count.members} members · {ws?._count.media} media assets
          </div>
        </div>
        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
        <div>
          <div style={{ fontWeight: 700 }}>{t(locale, "role")}</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            {user?.name} — {user?.role}. OWNER and ADMIN can approve or reject posts; MEMBER can draft and submit; CLIENT is read-mostly.
          </div>
        </div>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n";
import { initials } from "@/lib/utils";

export default async function LoginPage() {
  const user = await currentUser();
  if (user) redirect("/");
  const locale = await getLocale();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="panel" style={{ maxWidth: 480, width: "100%", padding: 32 }}>
        <div style={{ fontSize: 30, fontWeight: 800 }}>
          {t(locale, "appName")}<span style={{ color: "#6366f1" }}>.</span>
        </div>
        <p className="muted" style={{ marginTop: 6 }}>{t(locale, "tagline")}</p>
        <h1 style={{ fontSize: 18, marginTop: 24 }}>{t(locale, "demo_signin_title")}</h1>
        <p className="muted" style={{ fontSize: 13 }}>{t(locale, "demo_signin_note")}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
          {users.map((u) => (
            <form key={u.id} action="/api/login" method="post">
              <input type="hidden" name="userId" value={u.id} />
              <button type="submit" className="panel-2" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 12, cursor: "pointer", color: "inherit", textAlign: "start", border: "1px solid var(--border)" }}>
                <span style={{ width: 40, height: 40, borderRadius: "50%", background: u.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                  {initials(u.name)}
                </span>
                <span>
                  <span style={{ display: "block", fontWeight: 700, fontSize: 15 }}>{u.name}</span>
                  <span className="muted" style={{ fontSize: 12 }}>{t(locale, "role")}: {u.role}</span>
                </span>
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}

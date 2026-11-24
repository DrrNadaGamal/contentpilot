import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n";
import { initials } from "@/lib/utils";

export default async function TeamPage() {
  const locale = await getLocale();
  const members = await prisma.workspaceMember.findMany({
    include: { user: true, workspace: true },
    orderBy: { role: "asc" },
  });
  const ws = members[0]?.workspace;
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 0 }}>{t(locale, "team_members")}</h1>
      {ws && (
        <p className="muted" style={{ fontSize: 13 }}>
          {t(locale, "workspace")}: <strong style={{ color: "var(--text)" }}>{ws.name}</strong> · {t(locale, "plan")}: {ws.plan}
        </p>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14, marginTop: 18 }}>
        {members.map((m) => (
          <div key={m.id} className="panel" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 44, height: 44, borderRadius: "50%", background: m.user.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
              {initials(m.user.name)}
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{m.user.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>{m.user.email}</div>
              <span className="chip" style={{ marginTop: 6, fontSize: 11 }}>{m.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

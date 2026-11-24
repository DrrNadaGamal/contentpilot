import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n";
import StatCard from "@/components/StatCard";
import PostCard from "@/components/PostCard";
import Link from "next/link";

export default async function DashboardPage() {
  const locale = await getLocale();
  const now = new Date();
  const in30 = new Date(now.getTime() - 30 * 86400000);
  const [total, scheduled, pending, published30, upcoming, review] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "SCHEDULED" } }),
    prisma.post.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.post.count({ where: { status: "PUBLISHED", publishedAt: { gte: in30 } } }),
    prisma.post.findMany({
      where: { scheduledAt: { gte: now }, status: { in: ["SCHEDULED", "APPROVED"] } },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      include: { brand: true, author: true, media: false },
    }),
    prisma.post.findMany({
      where: { status: "PENDING_APPROVAL" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { brand: true, author: true, media: true },
    }),
  ]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{t(locale, "nav_dashboard")}</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <StatCard label={t(locale, "total_posts")} value={total} accent="#e8ecf6" />
        <StatCard label={t(locale, "scheduled")} value={scheduled} accent="#3b82f6" />
        <StatCard label={t(locale, "pending_approval")} value={pending} accent="#f59e0b" />
        <StatCard label={t(locale, "published_30d")} value={published30} accent="#8b5cf6" />
      </div>
      <section>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>{t(locale, "upcoming")}</h2>
          <Link href="/calendar" className="muted" style={{ fontSize: 13 }}>{t(locale, "view_all")}</Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
          {upcoming.map((p) => (
            <PostCard key={p.id} post={{ ...p, media: null }} locale={locale} showMedia={false} />
          ))}
        </div>
      </section>
      <section>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>{t(locale, "needs_review")}</h2>
          <Link href="/approvals" className="muted" style={{ fontSize: 13 }}>{t(locale, "view_all")}</Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
          {review.length === 0 && <p className="muted">{t(locale, "no_pending")}</p>}
          {review.map((p) => (
            <PostCard key={p.id} post={p} locale={locale} />
          ))}
        </div>
      </section>
    </div>
  );
}

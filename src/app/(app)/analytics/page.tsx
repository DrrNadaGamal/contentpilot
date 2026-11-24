import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n";
import AnalyticsClient from "@/components/AnalyticsClient";

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ brand?: string }> }) {
  const locale = await getLocale();
  const { brand: brandId } = await searchParams;
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  const active = brands.find((b) => b.id === brandId) ?? brands[0];

  const since = new Date(Date.now() - 90 * 86400000);
  const metrics = await prisma.analyticsMetric.findMany({
    where: { brandId: active.id, date: { gte: since } },
    orderBy: { date: "asc" },
  });

  // Daily engagement trend (all channels summed)
  const byDay = new Map<string, { date: string; engagements: number; impressions: number; clicks: number }>();
  for (const m of metrics) {
    const k = m.date.toISOString().slice(0, 10);
    const cur = byDay.get(k) ?? { date: k, engagements: 0, impressions: 0, clicks: 0 };
    cur.engagements += m.engagements;
    cur.impressions += m.impressions;
    cur.clicks += m.clicks;
    byDay.set(k, cur);
  }
  const trend = Array.from(byDay.values());

  // Per-channel totals + latest followers
  const byChannel = new Map<string, { channel: string; engagements: number; impressions: number; followers: number }>();
  for (const m of metrics) {
    const cur = byChannel.get(m.channel) ?? { channel: m.channel, engagements: 0, impressions: 0, followers: 0 };
    cur.engagements += m.engagements;
    cur.impressions += m.impressions;
    cur.followers = Math.max(cur.followers, m.followers);
    byChannel.set(m.channel, cur);
  }
  const channels = Array.from(byChannel.values());

  // Weekday averages
  const byWeekday = new Map<number, { total: number; n: number }>();
  for (const m of metrics) {
    const wd = m.date.getDay();
    const cur = byWeekday.get(wd) ?? { total: 0, n: 0 };
    cur.total += m.engagements;
    cur.n += 1;
    byWeekday.set(wd, cur);
  }
  const weekdays = Array.from({ length: 7 }, (_, i) => {
    const cur = byWeekday.get(i) ?? { total: 0, n: 1 };
    return {
      day: new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", { weekday: "short" }).format(new Date(2024, 0, 7 + i)),
      avg: Math.round(cur.total / cur.n),
    };
  });

  const statusCounts = await prisma.post.groupBy({ by: ["status"], _count: { status: true } });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 0 }}>
        {t(locale, "analytics_for")} {active.name}
      </h1>
      <div style={{ display: "flex", gap: 8, margin: "12px 0 20px", flexWrap: "wrap" }}>
        {brands.map((b) => (
          <a
            key={b.id}
            href={`/analytics?brand=${b.id}`}
            className="chip"
            style={{
              textDecoration: "none",
              color: b.id === active.id ? b.color : "var(--muted)",
              borderColor: b.id === active.id ? b.color : "var(--border)",
            }}
          >
            {b.name}
          </a>
        ))}
      </div>
      <AnalyticsClient
        trend={trend}
        channels={channels}
        weekdays={weekdays}
        statuses={statusCounts.map((s) => ({ status: s.status, count: s._count.status }))}
        labels={{
          trend: t(locale, "engagement_trend"),
          byChannel: t(locale, "engagement_by_channel"),
          byStatus: t(locale, "posts_per_status"),
          byWeekday: t(locale, "best_days"),
          impressions: t(locale, "impressions"),
          engagements: t(locale, "engagements"),
          clicks: t(locale, "clicks"),
          followers: t(locale, "followers"),
        }}
      />
    </div>
  );
}

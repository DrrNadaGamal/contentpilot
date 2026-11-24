import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n";
import CalendarClient from "@/components/CalendarClient";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const locale = await getLocale();
  const sp = await searchParams;
  const base = sp.month ? new Date(`${sp.month}-01T00:00:00`) : new Date();
  const year = base.getFullYear();
  const month = base.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);
  const posts = await prisma.post.findMany({
    where: { scheduledAt: { gte: start, lt: end } },
    include: { brand: true, author: true },
    orderBy: { scheduledAt: "asc" },
  });
  const unscheduled = await prisma.post.findMany({
    where: { scheduledAt: null, status: { in: ["DRAFT", "APPROVED"] } },
    include: { brand: true, author: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  const serialized = posts.map((p) => ({
    id: p.id,
    content: p.content.slice(0, 80),
    status: p.status,
    brandColor: p.brand.color,
    brandName: p.brand.name,
    authorName: p.author.name,
    scheduledAt: p.scheduledAt ? p.scheduledAt.toISOString() : null,
  }));
  const unser = unscheduled.map((p) => ({
    id: p.id,
    content: p.content.slice(0, 80),
    status: p.status,
    brandColor: p.brand.color,
    brandName: p.brand.name,
    authorName: p.author.name,
    scheduledAt: null as string | null,
  }));
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 0 }}>{t(locale, "nav_calendar")}</h1>
      <CalendarClient
        locale={locale}
        year={year}
        month={month}
        posts={serialized}
        unscheduled={unser}
        labels={{
          today: t(locale, "today"),
          empty: t(locale, "empty_calendar"),
          unscheduled: t(locale, "unscheduled"),
          reschedule_hint: t(locale, "reschedule_hint"),
          new_date: t(locale, "new_date"),
          apply: t(locale, "apply"),
        }}
      />
    </div>
  );
}

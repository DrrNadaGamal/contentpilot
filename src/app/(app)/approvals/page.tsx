import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n";
import ApprovalsClient from "@/components/ApprovalsClient";

export default async function ApprovalsPage() {
  const locale = await getLocale();
  const user = await currentUser();
  const canReview = !!user && ["OWNER", "ADMIN"].includes(user.role);
  const pending = await prisma.post.findMany({
    where: { status: "PENDING_APPROVAL" },
    orderBy: { createdAt: "desc" },
    include: { brand: true, author: true, media: true },
  });
  const decided = await prisma.approval.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { reviewer: true, post: { include: { brand: true, author: true, media: true } } },
  });
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 0 }}>{t(locale, "approval_queue")}</h1>
      <ApprovalsClient
        locale={locale}
        canReview={canReview}
        pending={pending.map((p) => ({
          id: p.id, content: p.content, status: p.status, channels: p.channels,
          scheduledAt: p.scheduledAt ? p.scheduledAt.toISOString() : null,
          publishedAt: null,
          brand: { name: p.brand.name, color: p.brand.color },
          author: { name: p.author.name },
          media: p.media ? { path: p.media.path, title: p.media.title } : null,
        }))}
        decided={decided.map((a) => ({
          id: a.id,
          decision: a.decision,
          note: a.note,
          reviewer: a.reviewer.name,
          createdAt: a.createdAt.toISOString(),
          postContent: a.post.content.slice(0, 100),
          brandName: a.post.brand.name,
        }))}
        labels={{
          approve: t(locale, "approve"),
          reject: t(locale, "reject"),
          reject_note: t(locale, "reject_note"),
          approve_note: t(locale, "approve_note"),
          no_pending: t(locale, "no_pending"),
        }}
      />
    </div>
  );
}

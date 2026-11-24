import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n";
import ComposerClient from "@/components/ComposerClient";

export default async function ComposerPage() {
  const locale = await getLocale();
  const [brands, media] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 0 }}>{t(locale, "create_post")}</h1>
      <p className="muted" style={{ fontSize: 13, maxWidth: 640 }}>{t(locale, "composer_ai_note")}</p>
      <ComposerClient
        locale={locale}
        brands={brands.map((b) => ({ id: b.id, name: b.name, color: b.color }))}
        media={media.map((m) => ({ id: m.id, title: m.title, path: m.path }))}
        labels={{
          content: t(locale, "content"),
          content_ar: t(locale, "content_ar"),
          channels: t(locale, "channels"),
          brand: t(locale, "brand"),
          schedule_for: t(locale, "schedule_for"),
          attach_media: t(locale, "attach_media"),
          save_draft: t(locale, "save_draft"),
          submit_approval: t(locale, "submit_approval"),
          preview: t(locale, "preview"),
          characters: t(locale, "characters"),
          over_limit: t(locale, "over_limit"),
          ai_badge: t(locale, "ai_draft_badge"),
        }}
      />
    </div>
  );
}

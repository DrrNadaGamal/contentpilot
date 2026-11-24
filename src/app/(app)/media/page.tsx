import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n";

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const locale = await getLocale();
  const { q } = await searchParams;
  const media = await prisma.mediaAsset.findMany({
    where: q ? { OR: [{ title: { contains: q } }, { tags: { contains: q } }] } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 0 }}>{t(locale, "media_library")}</h1>
      <form method="get" style={{ margin: "14px 0 20px" }}>
        <input className="input" name="q" defaultValue={q ?? ""} placeholder={t(locale, "search_media")} style={{ maxWidth: 380 }} />
      </form>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
        {media.map((m) => (
          <div key={m.id} className="panel" style={{ overflow: "hidden" }}>
            <Image src={m.path} alt={m.title} width={400} height={210} style={{ width: "100%", height: "auto", display: "block" }} />
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{m.title}</div>
              <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{m.tags}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import Image from "next/image";
import { fmtDate } from "@/lib/utils";
import { StatusBadge, ChannelBadge } from "./Badges";
import { t, type Locale } from "@/lib/i18n";

export type PostWithRels = {
  id: string;
  content: string;
  status: string;
  channels: string;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  brand: { name: string; color: string };
  author: { name: string };
  media?: { path: string; title: string } | null;
};

export default function PostCard({ post, locale, showMedia = true }: { post: PostWithRels; locale: Locale; showMedia?: boolean }) {
  return (
    <div className="panel" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span className="chip" style={{ borderColor: post.brand.color + "66", color: post.brand.color }}>
          {post.brand.name}
        </span>
        <StatusBadge status={post.status} locale={locale} />
        <span className="muted" style={{ fontSize: 12, marginInlineStart: "auto" }}>
          {t(locale, "submitted_by")} {post.author.name} · {fmtDate(post.scheduledAt ?? post.publishedAt, locale)}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>{post.content}</p>
      {showMedia && post.media && (
        <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)" }}>
          <Image src={post.media.path} alt={post.media.title} width={640} height={300} style={{ width: "100%", height: "auto", display: "block" }} />
        </div>
      )}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {post.channels.split(",").map((c) => (
          <ChannelBadge key={c} channel={c} />
        ))}
      </div>
    </div>
  );
}

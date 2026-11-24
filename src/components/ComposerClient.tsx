"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CHANNELS, CHANNEL_LIMITS, type Channel, CHANNEL_COLORS } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

type BrandOpt = { id: string; name: string; color: string };
type MediaOpt = { id: string; title: string; path: string };

export default function ComposerClient({
  locale, brands, media, labels,
}: {
  locale: Locale; brands: BrandOpt[]; media: MediaOpt[]; labels: Record<string, string>;
}) {
  const router = useRouter();
  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");
  const [content, setContent] = useState("");
  const [contentAr, setContentAr] = useState("");
  const [chans, setChans] = useState<Channel[]>(["LINKEDIN"]);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [busy, setBusy] = useState<"draft" | "submit" | null>(null);
  const [error, setError] = useState("");

  const toggle = (c: Channel) =>
    setChans((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));

  async function save(submit: boolean) {
    setError("");
    if (!content.trim()) { setError("Content is required"); return; }
    if (chans.length === 0) { setError("Pick at least one channel"); return; }
    if (submit && !scheduledAt) { setError("Pick a schedule time"); return; }
    setBusy(submit ? "submit" : "draft");
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId, content, contentAr, channels: chans, scheduledAt: scheduledAt || null, mediaId, submit }),
    });
    setBusy(null);
    if (!res.ok) { setError((await res.json()).error ?? "Failed"); return; }
    router.push(submit ? "/approvals" : "/calendar");
    router.refresh();
  }

  const selMedia = media.find((m) => m.id === mediaId) ?? null;

  return (
    <div className="stack-mobile" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 16, alignItems: "start" }}>
      <div className="panel" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label className="muted" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>{labels.brand}</label>
          <select className="select" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="muted" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>{labels.channels}</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CHANNELS.map((c) => (
              <button
                key={c}
                type="button"
                className="chip"
                onClick={() => toggle(c)}
                style={{
                  cursor: "pointer",
                  background: chans.includes(c) ? CHANNEL_COLORS[c] + "22" : "transparent",
                  borderColor: chans.includes(c) ? CHANNEL_COLORS[c] : "var(--border)",
                  color: chans.includes(c) ? CHANNEL_COLORS[c] : "var(--muted)",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="muted" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>{labels.content}</label>
          <textarea className="textarea" dir="ltr" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write the post in English..." />
        </div>
        <div>
          <label className="muted" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>{labels.content_ar}</label>
          <textarea className="textarea" dir="rtl" value={contentAr} onChange={(e) => setContentAr(e.target.value)} placeholder="اكتب المنشور بالعربية..." />
        </div>
        <div>
          <label className="muted" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>{labels.attach_media}</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {media.map((m) => (
              <button
                key={m.id} type="button" title={m.title} onClick={() => setMediaId(mediaId === m.id ? null : m.id)}
                style={{
                  border: mediaId === m.id ? "2px solid #6366f1" : "1px solid var(--border)",
                  borderRadius: 8, overflow: "hidden", cursor: "pointer", padding: 0, background: "none",
                }}
              >
                <Image src={m.path} alt={m.title} width={160} height={84} style={{ width: "100%", height: "auto", display: "block" }} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="muted" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>{labels.schedule_for}</label>
          <input className="input" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{error}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" disabled={busy !== null} onClick={() => save(false)}>
            {busy === "draft" ? "..." : labels.save_draft}
          </button>
          <button className="btn" disabled={busy !== null} onClick={() => save(true)}>
            {busy === "submit" ? "..." : labels.submit_approval}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ fontSize: 16, margin: 0 }}>{labels.preview}</h2>
        {chans.length === 0 && <p className="muted" style={{ fontSize: 13 }}>-</p>}
        {chans.map((c) => {
          const limit = CHANNEL_LIMITS[c];
          const len = content.length;
          const over = len > limit;
          return (
            <div key={c} className="panel" style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span className="chip" style={{ color: CHANNEL_COLORS[c], borderColor: CHANNEL_COLORS[c] + "66" }}>{c}</span>
                <span className="muted" style={{ fontSize: 12, marginInlineStart: "auto", color: over ? "#ef4444" : undefined }}>
                  {len} / {limit} {labels.characters}{over ? ` (${labels.over_limit})` : ""}
                </span>
              </div>
              <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap" }} dir="auto">
                {content || <span className="muted">...</span>}
              </p>
              {contentAr && (
                <p dir="rtl" style={{ fontSize: 13, lineHeight: 1.6, borderTop: "1px dashed var(--border)", paddingTop: 8, marginTop: 8, marginBottom: 0 }}>
                  {contentAr}
                </p>
              )}
              {selMedia && (
                <div style={{ marginTop: 10, borderRadius: 8, overflow: "hidden" }}>
                  <Image src={selMedia.path} alt={selMedia.title} width={400} height={210} style={{ width: "100%", height: "auto", display: "block" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

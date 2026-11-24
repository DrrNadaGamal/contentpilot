"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PostCard, { type PostWithRels } from "./PostCard";
import { fmtDate } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

type PendingPost = Omit<PostWithRels, "scheduledAt" | "publishedAt"> & { scheduledAt: string | null; publishedAt: string | null };
type Decided = { id: string; decision: string; note: string | null; reviewer: string; createdAt: string; postContent: string; brandName: string };

export default function ApprovalsClient({
  locale, canReview, pending, decided, labels,
}: {
  locale: Locale; canReview: boolean; pending: PendingPost[]; decided: Decided[]; labels: Record<string, string>;
}) {
  const router = useRouter();
  const [note, setNote] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function decide(postId: string, decision: "APPROVED" | "REJECTED") {
    setBusy(postId + decision);
    await fetch("/api/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, decision, note: note[postId] }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {pending.length === 0 && <p className="muted">{labels.no_pending}</p>}
      {pending.map((p) => (
        <div key={p.id} className="panel" style={{ padding: 4 }}>
          <PostCard post={p as unknown as PostWithRels} locale={locale} />
          {canReview && (
            <div style={{ padding: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input
                className="input"
                style={{ flex: 1, minWidth: 220 }}
                placeholder={labels.approve_note}
                value={note[p.id] ?? ""}
                onChange={(e) => setNote((n) => ({ ...n, [p.id]: e.target.value }))}
              />
              <button className="btn btn-success" disabled={busy !== null} onClick={() => decide(p.id, "APPROVED")}>
                {labels.approve}
              </button>
              <button className="btn btn-danger" disabled={busy !== null} onClick={() => decide(p.id, "REJECTED")}>
                {labels.reject}
              </button>
            </div>
          )}
        </div>
      ))}
      {decided.length > 0 && (
        <div className="panel" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>History</h3>
          {decided.map((d) => (
            <div key={d.id} className="panel-2" style={{ padding: 10, marginTop: 8, fontSize: 13 }}>
              <span className="chip" style={{ color: d.decision === "APPROVED" ? "#22c55e" : "#ef4444", borderColor: "var(--border)", marginInlineEnd: 8 }}>
                {d.decision}
              </span>
              <strong>{d.brandName}</strong> · {d.postContent}... · {d.reviewer} · {fmtDate(d.createdAt, locale)}
              {d.note && <div className="muted" style={{ marginTop: 4 }}>{d.note}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

type CalPost = {
  id: string; content: string; status: string; brandColor: string;
  brandName: string; authorName: string; scheduledAt: string | null;
};

const STATUS_DOT: Record<string, string> = {
  DRAFT: "#64748b", PENDING_APPROVAL: "#f59e0b", APPROVED: "#22c55e",
  REJECTED: "#ef4444", SCHEDULED: "#3b82f6", PUBLISHED: "#8b5cf6",
};

export default function CalendarClient({
  locale, year, month, posts, unscheduled, labels,
}: {
  locale: Locale; year: number; month: number; posts: CalPost[]; unscheduled: CalPost[];
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<CalPost | null>(null);
  const [newDate, setNewDate] = useState("");
  const [saving, setSaving] = useState(false);

  const first = new Date(year, month, 1);
  const startWeekday = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const byDay = new Map<number, CalPost[]>();
  for (const p of posts) {
    if (!p.scheduledAt) continue;
    const d = new Date(p.scheduledAt).getDate();
    byDay.set(d, [...(byDay.get(d) ?? []), p]);
  }

  const monthParam = `${year}-${String(month + 1).padStart(2, "0")}`;
  const prev = new Date(year, month - 1, 1);
  const next = new Date(year, month + 1, 1);
  const pParam = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
  const nParam = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;

  const monthName = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", { month: "long", year: "numeric" }).format(first);
  const weekdayNames = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", { weekday: "short" }).format(new Date(2024, 0, 1 + i))
  );

  async function saveDate() {
    if (!selected || !newDate) return;
    setSaving(true);
    await fetch(`/api/posts/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt: new Date(newDate).toISOString(), status: selected.status === "DRAFT" ? "SCHEDULED" : selected.status }),
    });
    setSaving(false);
    setSelected(null);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="btn btn-ghost" onClick={() => router.push(`/calendar?month=${pParam}`)}>←</button>
        <h2 style={{ margin: 0, fontSize: 18, minWidth: 200, textAlign: "center" }}>{monthName}</h2>
        <button className="btn btn-ghost" onClick={() => router.push(`/calendar?month=${nParam}`)}>→</button>
        <button className="btn btn-ghost" onClick={() => router.push("/calendar")}>{labels.today}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {weekdayNames.map((w) => (
          <div key={w} className="muted" style={{ fontSize: 12, fontWeight: 700, textAlign: "center" }}>{w}</div>
        ))}
        {cells.map((d, i) => (
          <div key={i} className={`cal-day ${d === null ? "dim" : ""}`}>
            {d !== null && (
              <>
                <div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>{d}</div>
                {(byDay.get(d) ?? []).slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="cal-post"
                    style={{ borderInlineStartColor: STATUS_DOT[p.status] ?? p.brandColor, cursor: "pointer" }}
                    title={`${p.brandName} · ${p.authorName}`}
                    onClick={() => setSelected(p)}
                  >
                    {p.content}
                  </div>
                ))}
                {(byDay.get(d) ?? []).length > 3 && (
                  <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>+{(byDay.get(d) ?? []).length - 3}</div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {unscheduled.length > 0 && (
        <div className="panel" style={{ padding: 14 }}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>{labels.unscheduled}</h3>
          {unscheduled.map((p) => (
            <div key={p.id} className="panel-2" style={{ padding: 10, marginTop: 8, cursor: "pointer" }} onClick={() => setSelected(p)}>
              <span className="chip" style={{ borderColor: p.brandColor + "66", color: p.brandColor, marginInlineEnd: 8 }}>{p.brandName}</span>
              <span style={{ fontSize: 13 }}>{p.content}</span>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="panel" style={{ padding: 16, borderColor: "#6366f1" }}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>{labels.reschedule_hint}</h3>
          <p style={{ fontSize: 13 }}>{selected.content}</p>
          <label className="muted" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>{labels.new_date}</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="input" type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} style={{ maxWidth: 260 }} />
            <button className="btn" onClick={saveDate} disabled={saving || !newDate}>{labels.apply}</button>
            <button className="btn btn-ghost" onClick={() => setSelected(null)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#6366f1", "#0ea5e9", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6"];

export default function AnalyticsClient({
  trend, channels, weekdays, statuses, labels,
}: {
  trend: { date: string; engagements: number; impressions: number; clicks: number }[];
  channels: { channel: string; engagements: number; impressions: number; followers: number }[];
  weekdays: { day: string; avg: number }[];
  statuses: { status: string; count: number }[];
  labels: Record<string, string>;
}) {
  const totals = channels.reduce(
    (acc, c) => ({
      impressions: acc.impressions + c.impressions,
      engagements: acc.engagements + c.engagements,
      followers: acc.followers + c.followers,
    }),
    { impressions: 0, engagements: 0, followers: 0 }
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {[
          [labels.impressions, totals.impressions.toLocaleString(), "#0ea5e9"],
          [labels.engagements, totals.engagements.toLocaleString(), "#6366f1"],
          [labels.followers, totals.followers.toLocaleString(), "#10b981"],
        ].map(([l, v, c]) => (
          <div key={l as string} className="panel" style={{ padding: "14px 18px" }}>
            <div className="muted" style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>{l}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: c as string }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="panel" style={{ padding: 18 }}>
        <h3 style={{ marginTop: 0, fontSize: 15 }}>{labels.trend}</h3>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <AreaChart data={trend} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="eng" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="1" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#243050" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "#94a3c0", fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} />
              <YAxis tick={{ fill: "#94a3c0", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#18223d", border: "1px solid #243050", borderRadius: 10 }} labelStyle={{ color: "#e8ecf6" }} />
              <Area type="monotone" dataKey="engagements" stroke="#6366f1" fill="url(#eng)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="panel" style={{ padding: 18 }}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>{labels.byChannel}</h3>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={channels} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#243050" strokeDasharray="3 3" />
                <XAxis dataKey="channel" tick={{ fill: "#94a3c0", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3c0", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#18223d", border: "1px solid #243050", borderRadius: 10 }} />
                <Bar dataKey="engagements" radius={[6, 6, 0, 0]}>
                  {channels.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel" style={{ padding: 18 }}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>{labels.byStatus}</h3>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statuses} dataKey="count" nameKey="status" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {statuses.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#18223d", border: "1px solid #243050", borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: 18 }}>
        <h3 style={{ marginTop: 0, fontSize: 15 }}>{labels.byWeekday}</h3>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={weekdays} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#243050" strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fill: "#94a3c0", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3c0", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#18223d", border: "1px solid #243050", borderRadius: 10 }} />
              <Bar dataKey="avg" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

import { STATUS_COLORS, CHANNEL_COLORS, type Channel } from "@/lib/utils";
import { t, type Locale, type TKey } from "@/lib/i18n";

export function StatusBadge({ status, locale }: { status: string; locale: Locale }) {
  const key = `status_${status}` as TKey;
  const color = STATUS_COLORS[status] ?? "#64748b";
  return (
    <span className="chip" style={{ color, borderColor: color + "55", background: color + "14" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
      {t(locale, key)}
    </span>
  );
}

export function ChannelBadge({ channel }: { channel: string }) {
  const c = channel as Channel;
  const color = CHANNEL_COLORS[c] ?? "#94a3b8";
  return (
    <span className="chip" style={{ color, borderColor: color + "55", background: color + "12", fontSize: 11 }}>
      {channel}
    </span>
  );
}

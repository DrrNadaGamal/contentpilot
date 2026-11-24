export default function StatCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="panel" style={{ padding: "16px 18px" }}>
      <div className="muted" style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6, color: accent }}>{value}</div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { getLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  const locale = await getLocale();
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar locale={locale} userName={user.name} userRole={user.role} />
      <main style={{ flex: 1, padding: "28px 32px", maxWidth: 1280, margin: "0 auto", width: "100%" }}>
        {children}
        <p className="muted" style={{ marginTop: 40, fontSize: 12, textAlign: "center" }}>
          {t(locale, "footer_demo")}
        </p>
      </main>
    </div>
  );
}

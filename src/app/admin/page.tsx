import { redirect } from "next/navigation";
import { getAdminServerSession } from "@/lib/admin/auth";
import { AdminDashboardClient } from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Console | Visitor Photo Slideshow",
  description: "Secure administration dashboard for visitor photo archive and live slideshow management.",
};

export default async function AdminPage() {
  const session = await getAdminServerSession();

  if (!session.authenticated) {
    redirect("/admin/login");
  }

  return <AdminDashboardClient adminEmail={session.email || "admin@slideshow.internal"} />;
}

import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import DukkanPanel from "@/components/admin/DukkanPanel";

export default async function DukkanPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  return <DukkanPanel />;
}

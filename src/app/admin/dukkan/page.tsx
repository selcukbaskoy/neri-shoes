import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getProducts } from "@/lib/products";
import DukkanPanel from "@/components/admin/DukkanPanel";

export default async function DukkanPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }

  const products = await getProducts();

  return <DukkanPanel products={products} />;
}

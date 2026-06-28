import { isAdminAuthenticated } from "@/lib/auth";
import { getProducts } from "@/lib/products";
import { getBlogPosts } from "@/lib/blog";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminPanel from "@/components/admin/AdminPanel";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return <AdminLogin />;
  }

  const [products, blogPosts] = await Promise.all([getProducts(), getBlogPosts()]);
  return <AdminPanel initialProducts={products} initialBlogPosts={blogPosts} />;
}

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/lib/auth-context";
import { getOrders, linkGuestOrders } from "@/lib/customer-client";
import { formatPrice } from "@/lib/currency";
import type { OrderData } from "@/lib/types";

export default function OrdersPage() {
  const t = useTranslations("account");
  const tAuth = useTranslations("auth");
  const { loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [linkedCount, setLinkedCount] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/hesap/giris");
      return;
    }
    if (isAuthenticated) loadOrders();
  }, [authLoading, isAuthenticated, router]);

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const data = await getOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleLinkGuest() {
    try {
      const data = await linkGuestOrders();
      setLinkedCount(data.linked || 0);
      loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    }
  }

  function statusClass(status: string) {
    const map: Record<string, string> = {
      pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
      paid: "border-green-500/30 bg-green-500/10 text-green-400",
      processing: "border-blue-500/30 bg-blue-500/10 text-blue-400",
      shipped: "border-purple-500/30 bg-purple-500/10 text-purple-400",
      delivered: "border-accent/30 bg-accent/10 text-accent",
      cancelled: "border-red-500/30 bg-red-500/10 text-red-400",
      failed: "border-red-500/30 bg-red-500/10 text-red-400",
    };
    return map[status] || "border-muted/20 bg-muted/5 text-muted";
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl text-foreground">{t("orders")}</h1>
          <button
            onClick={handleLinkGuest}
            className="rounded border border-accent/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-accent transition-colors hover:border-accent hover:bg-accent/10"
          >
            Misafir Siparişlerini Eşleştir
          </button>
        </div>

        <AnimatePresence>
          {linkedCount !== null && linkedCount > 0 && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded border border-green-500/20 bg-green-500/5 px-4 py-2 text-xs text-green-400"
            >
              {linkedCount} misafir sipariş hesabınıza bağlandı.
            </motion.p>
          )}
        </AnimatePresence>

        {error && <p className="rounded border border-red-500/20 bg-red-500/5 px-4 py-2 text-xs text-red-400">{error}</p>}

        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-sm text-muted">{t("noOrders")}</p>
            <Link href="/urunler" className="rounded border border-accent/40 px-6 py-2.5 text-sm text-accent transition-colors hover:border-accent hover:bg-accent/10">
              {t("shopNow")}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-3 rounded-lg border border-[#222] bg-[#0f0f0f] p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted">#{order.id.slice(0, 8)}</span>
                    <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusClass(order.status)}`}>
                      {t(`status.${order.status}`) || order.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString("tr-TR") : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-accent">{formatPrice(order.total_amount, "tr", {})}</span>
                  <Link
                    href={`/hesap/siparisler/${order.id}`}
                    className="rounded border border-[#333] px-3 py-1.5 text-xs text-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    {t("viewOrder")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

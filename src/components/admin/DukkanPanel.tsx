"use client";

import { useState } from "react";
import Link from "next/link";
import DukkanSatis from "./DukkanSatis";
import DukkanStok from "./DukkanStok";
import DukkanVeresiye from "./DukkanVeresiye";
import DukkanGunSonu from "./DukkanGunSonu";
import type { Product } from "@/lib/types";

type DukkanTab = "satis" | "stok" | "veresiye" | "gunsonu";

const TABS: { key: DukkanTab; label: string }[] = [
  { key: "satis", label: "Hızlı Satış" },
  { key: "stok", label: "Stok" },
  { key: "veresiye", label: "Veresiye" },
  { key: "gunsonu", label: "Gün Sonu" },
];

export default function DukkanPanel({ products }: { products: Product[] }) {
  const [activeTab, setActiveTab] = useState<DukkanTab>("satis");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-xs uppercase tracking-[0.1em] text-muted hover:text-accent">
            ← Admin Panel
          </Link>
          <h1 className="section-title mt-1">Dükkan</h1>
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-[#222]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 px-4 text-sm font-semibold uppercase tracking-wide transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-accent text-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "satis" ? (
        <DukkanSatis />
      ) : activeTab === "stok" ? (
        <DukkanStok products={products} />
      ) : activeTab === "veresiye" ? (
        <DukkanVeresiye />
      ) : (
        <DukkanGunSonu />
      )}
    </div>
  );
}

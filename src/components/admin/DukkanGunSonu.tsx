"use client";

import { useEffect, useState } from "react";

interface Summary {
  date: string;
  store: { nakit: number; pos: number; veresiye: number };
  manual: { nakit: number; pos: number };
  online: number;
  creditCollected: { nakit: number; pos: number };
  creditCollectedTotal: number;
  totalRevenue: number;
}

function todayIstanbul() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });
}

export default function DukkanGunSonu() {
  const [date, setDate] = useState(todayIstanbul());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    fetch(`/api/admin/dukkan/gunsonu?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        setSummary(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [date]);

  const nakitTotal = (summary?.store.nakit ?? 0) + (summary?.manual.nakit ?? 0);
  const posTotal = (summary?.store.pos ?? 0) + (summary?.manual.pos ?? 0);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <label className="text-xs uppercase tracking-[0.1em] text-muted">Tarih</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border border-[#2a2a2a] bg-[#111] px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
        />
      </div>

      {!loaded ? (
        <p className="text-sm text-muted">Yükleniyor...</p>
      ) : !summary ? (
        <p className="text-sm text-muted">Veri alınamadı.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <h3 className="mb-3 text-xs uppercase tracking-[0.1em] text-muted">Mağaza Satışı</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Nakit</dt>
                <dd className="text-foreground">{summary.store.nakit.toLocaleString("tr-TR")} TL</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">POS</dt>
                <dd className="text-foreground">{summary.store.pos.toLocaleString("tr-TR")} TL</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Veresiye (yeni)</dt>
                <dd className="text-foreground">{summary.store.veresiye.toLocaleString("tr-TR")} TL</dd>
              </div>
            </dl>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-xs uppercase tracking-[0.1em] text-muted">Stok Dışı Satış (manuel)</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Nakit</dt>
                <dd className="text-foreground">{summary.manual.nakit.toLocaleString("tr-TR")} TL</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">POS</dt>
                <dd className="text-foreground">{summary.manual.pos.toLocaleString("tr-TR")} TL</dd>
              </div>
            </dl>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-xs uppercase tracking-[0.1em] text-muted">Online Sipariş</h3>
            <p className="text-2xl font-bold text-accent">{summary.online.toLocaleString("tr-TR")} TL</p>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-xs uppercase tracking-[0.1em] text-muted">Veresiye Tahsilatı (bugün)</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Nakit</dt>
                <dd className="text-foreground">{summary.creditCollected.nakit.toLocaleString("tr-TR")} TL</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">POS</dt>
                <dd className="text-foreground">{summary.creditCollected.pos.toLocaleString("tr-TR")} TL</dd>
              </div>
            </dl>
          </div>

          <div className="card p-5 md:col-span-2">
            <div className="mb-3 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-muted">Toplam Nakit</p>
                <p className="text-lg font-semibold text-foreground">{nakitTotal.toLocaleString("tr-TR")} TL</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-muted">Toplam POS</p>
                <p className="text-lg font-semibold text-foreground">{posTotal.toLocaleString("tr-TR")} TL</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-muted">Yeni Veresiye</p>
                <p className="text-lg font-semibold text-foreground">{summary.store.veresiye.toLocaleString("tr-TR")} TL</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-muted">Online</p>
                <p className="text-lg font-semibold text-foreground">{summary.online.toLocaleString("tr-TR")} TL</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[#222] pt-4">
              <span className="text-sm text-muted">Günlük Ciro (mağaza + online, veresiye dahil)</span>
              <span className="text-2xl font-bold text-accent">{summary.totalRevenue.toLocaleString("tr-TR")} TL</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

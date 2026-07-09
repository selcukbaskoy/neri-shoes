// src/lib/customer-client.ts
// Client-side helper: auth token ile /api/hesap/* route'larına istek atar.

import { supabase } from "./supabase";

async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const token = await getToken();
  if (!token) throw new Error("Oturum bulunamadı. Lütfen giriş yapın.");

  const res = await fetch(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Siparişler
export function getOrders() {
  return fetchWithAuth("/api/hesap/siparisler");
}

export function linkGuestOrders() {
  return fetchWithAuth("/api/hesap/siparisler", { method: "POST" });
}

// Adresler
export function getAddresses() {
  return fetchWithAuth("/api/hesap/adresler");
}

export function createAddress(address: Record<string, unknown>) {
  return fetchWithAuth("/api/hesap/adresler", { method: "POST", body: JSON.stringify(address) });
}

export function updateAddress(id: string, address: Record<string, unknown>) {
  return fetchWithAuth(`/api/hesap/adresler?id=${id}`, { method: "PUT", body: JSON.stringify(address) });
}

export function deleteAddress(id: string) {
  return fetchWithAuth(`/api/hesap/adresler?id=${id}`, { method: "DELETE" });
}

// Profil
export function getProfile() {
  return fetchWithAuth("/api/hesap/profil");
}

export function updateProfile(fields: Record<string, unknown>) {
  return fetchWithAuth("/api/hesap/profil", { method: "PUT", body: JSON.stringify(fields) });
}

// Hesap silme
export function deleteAccount() {
  return fetchWithAuth("/api/hesap/sil", { method: "DELETE" });
}

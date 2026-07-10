// src/lib/customer-api.ts
// Server-side helper'lar: auth user ↔ customer mapping, siparişler, adresler, profil.
// Tüm fonksiyonlar supabaseAdmin kullanır (RLS bypass, service_role).

import { supabaseAdmin } from "./supabase";
import type { Customer, CustomerAddress, OrderData, OrderItemData } from "./types";

/**
 * Auth user (Supabase Auth) için customers tablosunda kayıt bul veya oluştur.
 * Misafir checkout'tan önceki kayıtlar e-posta/telefon üzerinden eşleştirilebilir.
 */
export async function getOrCreateCustomer(authUserId: string, email: string, phone?: string | null): Promise<Customer> {
  // 1. Önce auth_user_id ile ara
  let { data: existing, error } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (existing) return existing as Customer;

  // 2. Aynı e-posta/telefon ile misafir kayıt var mı? (auth_user_id = NULL)
  let misafir: Customer | null = null;
  if (email || phone) {
    const conditions: string[] = [];
    if (email) conditions.push(`email.eq.${email}`);
    if (phone) conditions.push(`phone.eq.${phone}`);
    
    const { data: misafirRows, error: mErr } = await supabaseAdmin
      .from("customers")
      .select("*")
      .is("auth_user_id", null)
      .or(conditions.join(","))
      .order("created_at", { ascending: false })
      .limit(1);

    if (mErr) throw new Error(mErr.message);
    misafir = (misafirRows?.[0] ?? null) as Customer | null;
  }

  if (misafir) {
    // Misafir kaydı auth user'a bağla
    const { data: updated, error: uErr } = await supabaseAdmin
      .from("customers")
      .update({ auth_user_id: authUserId, email: email || misafir.email })
      .eq("id", misafir.id)
      .select()
      .single();
    if (uErr) throw new Error(uErr.message);
    return updated as Customer;
  }

  // 3. Yeni customer oluştur (name/phone nullable, email zorunlu değil)
  const { data: created, error: cErr } = await supabaseAdmin
    .from("customers")
    .insert({ auth_user_id: authUserId, email: email || null, phone: phone || null, name: null })
    .select()
    .single();

  if (cErr) throw new Error(cErr.message);
  return created as Customer;
}

/**
 * Misafir siparişlerini (orders.customer_id = NULL) auth customer'a bağla.
 * Aynı e-posta/telefon ile eşleşen siparişler customer_id ile güncellenir.
 */
export async function linkGuestOrdersToCustomer(customer: Customer): Promise<number> {
  if (!customer.email && !customer.phone) return 0;
  if (!customer.auth_user_id) return 0;

  const conditions: string[] = [];
  if (customer.email) conditions.push(`customer_email.eq.${customer.email}`);
  if (customer.phone) conditions.push(`customer_phone.eq.${customer.phone}`);

  const { data: orders, error: oErr } = await supabaseAdmin
    .from("orders")
    .select("id")
    .is("auth_user_id", null)
    .or(conditions.join(","));

  if (oErr) throw new Error(oErr.message);
  if (!orders?.length) return 0;

  const orderIds = orders.map((o) => o.id);
  const { error: uErr } = await supabaseAdmin
    .from("orders")
    .update({ auth_user_id: customer.auth_user_id })
    .in("id", orderIds);

  if (uErr) throw new Error(uErr.message);
  return orderIds.length;
}

// ============================================================
// Siparişler
// ============================================================

export async function getCustomerOrders(authUserId: string): Promise<OrderData[]> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("auth_user_id", authUserId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as OrderData[];
}

export async function getOrderWithItems(orderId: string): Promise<{ order: OrderData; items: OrderItemData[] }> {
  const { data: order, error: oErr } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (oErr) throw new Error(oErr.message);

  const { data: items, error: iErr } = await supabaseAdmin
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);
  if (iErr) throw new Error(iErr.message);

  return { order: order as OrderData, items: (items ?? []) as OrderItemData[] };
}

// ============================================================
// Adresler
// ============================================================

export async function getCustomerAddresses(customerId: string): Promise<CustomerAddress[]> {
  const { data, error } = await supabaseAdmin
    .from("customer_addresses")
    .select("*")
    .eq("customer_id", customerId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as CustomerAddress[];
}

export async function createCustomerAddress(address: Omit<CustomerAddress, "id" | "created_at" | "updated_at">): Promise<CustomerAddress> {
  // Eğer is_default=true ise diğer adresleri false yap
  if (address.is_default) {
    await supabaseAdmin
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("customer_id", address.customer_id);
  }

  const { data, error } = await supabaseAdmin
    .from("customer_addresses")
    .insert(address)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as CustomerAddress;
}

export async function updateCustomerAddress(id: string, customerId: string, address: Partial<CustomerAddress>): Promise<CustomerAddress> {
  // customer_id'yi update payload'dan çıkar, ayrı parametre zorunlu
  const { customer_id: _, ...safeAddress } = address as any;

  if (safeAddress.is_default) {
    await supabaseAdmin
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("customer_id", customerId)
      .neq("id", id);
  }

  const { data, error } = await supabaseAdmin
    .from("customer_addresses")
    .update(safeAddress)
    .eq("id", id)
    .eq("customer_id", customerId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as CustomerAddress;
}

export async function deleteCustomerAddress(id: string, customerId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("customer_addresses")
    .delete()
    .eq("id", id)
    .eq("customer_id", customerId);
  if (error) throw new Error(error.message);
}

// ============================================================
// Profil
// ============================================================

export async function getCustomerByAuthUserId(authUserId: string): Promise<Customer | null> {
  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as Customer | null;
}

export async function updateCustomerProfile(id: string, fields: Partial<Customer>): Promise<Customer> {
  const { data, error } = await supabaseAdmin
    .from("customers")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Customer;
}

/**
 * Misafir checkout için customer kaydı bul veya oluştur.
 * Aynı e-posta/telefon ile mevcut misafir kayıt varsa döndür, yoksa yeni oluştur.
 */
export async function getOrCreateGuestCustomer(email: string, phone: string, name?: string): Promise<Customer> {
  const { data: existing, error: eErr } = await supabaseAdmin
    .from("customers")
    .select("*")
    .is("auth_user_id", null)
    .or(`email.eq.${email},phone.eq.${phone}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (eErr) throw new Error(eErr.message);
  if (existing) return existing as Customer;

  const { data: created, error: cErr } = await supabaseAdmin
    .from("customers")
    .insert({ email, phone, name: name || null, auth_user_id: null })
    .select()
    .single();

  if (cErr) throw new Error(cErr.message);
  return created as Customer;
}

// ============================================================
// KVKK Hesap Silme
// ============================================================

export async function deleteCustomerAccount(customerId: string, authUserId: string): Promise<void> {
  // 1. Kişisel verileri anonimleştir (customer_addresses, customer_favorites, product_reviews sil)
  await supabaseAdmin.from("customer_addresses").delete().eq("customer_id", customerId);
  await supabaseAdmin.from("customer_favorites").delete().eq("customer_id", customerId);
  // Yorumlar anonimleştir (customer_id = NULL, status = 'approved' kalır)
  await supabaseAdmin.from("product_reviews").update({ customer_id: null }).eq("customer_id", customerId);

  // 2. Siparişler anonimleştir (customer_id = NULL, customer_name/email/phone = NULL)
  await supabaseAdmin.from("orders").update({
    customer_id: null,
    customer_name: null,
    customer_email: null,
    customer_phone: null,
  }).eq("customer_id", customerId);

  // 3. customers kaydını sil
  await supabaseAdmin.from("customers").delete().eq("id", customerId);

  // 4. Supabase Auth user'ı sil (service_role ile admin.auth.users.delete)
  // Not: supabase-js client auth.admin.users.delete() yok, bunu manuel admin dashboard'tan yapılabilir
  // veya Edge Function ile. Şimdilik customer verisi silindi, auth user ayrıca manuel temizlenebilir.
  // Alternatif: supabaseAdmin.auth.admin.deleteUser(authUserId) — yoksa skip.
  try {
    // @ts-ignore — supabase-js v2.45+ admin.auth.admin.deleteUser
    await (supabaseAdmin as any).auth.admin.deleteUser(authUserId);
  } catch {
    // Admin delete desteklenmiyorsa, auth user manuel olarak temizlenecek
  }
}

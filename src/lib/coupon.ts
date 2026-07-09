// src/lib/coupon.ts
// Kupon doğrulama ve indirim hesaplama helper'ları

import { supabaseAdmin } from "./supabase";

export interface CouponValidationResult {
  valid: boolean;
  couponId?: string;
  discountType?: "percent" | "fixed";
  discountValue?: number;
  discountAmount?: number;
  finalAmount?: number;
  error?: string;
}

/**
 * Kupon kodunu doğrula ve indirim tutarını hesapla.
 * Kupon geçersizse veya limit aşıldıysa error döner.
 */
export async function validateCoupon(
  code: string,
  cartTotal: number
): Promise<CouponValidationResult> {
  const normalizedCode = code.trim().toUpperCase();

  const { data: coupon, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .eq("code", normalizedCode)
    .eq("is_active", true)
    .single();

  if (error || !coupon) {
    return { valid: false, error: "Geçersiz kupon kodu." };
  }

  // Min. sipariş tutarı kontrolü
  if (coupon.min_order_amount > 0 && cartTotal < coupon.min_order_amount) {
    return {
      valid: false,
      error: `Bu kupon minimum ${coupon.min_order_amount} TL siparişte geçerlidir.`,
    };
  }

  // Geçerlilik tarihi
  const now = new Date();
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    return { valid: false, error: "Bu kupon henüz aktif değil." };
  }
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return { valid: false, error: "Bu kuponun süresi dolmuş." };
  }

  // Max kullanım limiti
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {
    return { valid: false, error: "Bu kupon kullanım limitine ulaştı." };
  }

  // İndirim hesapla
  let discountAmount = 0;
  if (coupon.discount_type === "percent") {
    discountAmount = Math.round((cartTotal * coupon.discount_value) / 100);
  } else if (coupon.discount_type === "fixed") {
    discountAmount = Math.min(coupon.discount_value, cartTotal); // indirim tutarı sepeti aşamaz
  }

  const finalAmount = Math.max(0, cartTotal - discountAmount);

  return {
    valid: true,
    couponId: coupon.id,
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value,
    discountAmount,
    finalAmount,
  };
}

/**
 * Kupon kullanımını kaydet (sipariş tamamlandığında çağrılır).
 */
export async function recordCouponRedemption(
  couponId: string,
  orderId: string,
  customerId: string | null,
  discountAmount: number
): Promise<void> {
  await supabaseAdmin.from("coupon_redemptions").insert({
    coupon_id: couponId,
    order_id: orderId,
    customer_id: customerId,
    discount_amount: discountAmount,
  });

  // used_count artır
  await supabaseAdmin.rpc("increment_coupon_used", {
    p_coupon_id: couponId,
  });
}

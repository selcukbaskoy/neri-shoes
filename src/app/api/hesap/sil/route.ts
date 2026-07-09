import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCustomerByAuthUserId, deleteCustomerAccount } from "@/lib/customer-api";

async function getAuthUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

// DELETE /api/hesap/sil
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });

  try {
    const customer = await getCustomerByAuthUserId(user.id);
    if (customer) {
      await deleteCustomerAccount(customer.id, user.id);
    }
    return NextResponse.json({ success: true, message: "Hesabınız ve kişisel verileriniz silindi." });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[hesap/sil] DELETE hatası:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { setRequestLocale } from "next-intl/server";
import { supabase } from "@/lib/supabase";
import CheckoutContent from "@/components/CheckoutContent";

type Props = { params: Promise<{ locale: string }> };

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { data } = await supabase
    .from("exchange_rates")
    .select("rates")
    .eq("base_currency", "TRY")
    .single();

  const rates: Record<string, number> = (data?.rates as Record<string, number>) ?? {};

  return <CheckoutContent rates={rates} />;
}

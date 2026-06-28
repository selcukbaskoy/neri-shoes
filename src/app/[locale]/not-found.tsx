import { getLocale, getTranslations } from "next-intl/server";
import NotFoundContent from "@/components/NotFoundContent";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "notFound" });

  return (
    <NotFoundContent
      title={t("title")}
      message={t("message")}
      backHome={t("backHome")}
      viewProducts={t("viewProducts")}
    />
  );
}

import { NextIntlClientProvider } from "next-intl";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = (await import("../../../messages/tr.json")).default;

  return (
    <NextIntlClientProvider locale="tr" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

"use client";

import { useEffect } from "react";

const RTL_LOCALES = ["ar"];

export default function HtmlAttributes({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
  }, [locale]);

  return null;
}

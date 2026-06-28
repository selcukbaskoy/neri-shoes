"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-32 text-center">
      <h1 className="mb-2 font-serif text-2xl font-bold text-accent">Bir şeyler ters gitti</h1>
      <p className="mb-8 text-sm text-muted">{error.message || "Beklenmeyen bir hata oluştu."}</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="btn-primary text-sm"
        >
          Tekrar Dene
        </button>
        <Link href="/" className="btn-primary text-sm">
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}

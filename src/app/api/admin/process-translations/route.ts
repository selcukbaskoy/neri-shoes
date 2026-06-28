import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getProducts, updateProduct } from "@/lib/products";
import { translateProductContent, translateMeta } from "@/lib/translate";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const products = await getProducts();
  const pending = products.filter((p) => p.translationStatus === "pending");

  if (pending.length === 0) {
    return NextResponse.json({ processed: 0, remaining: 0 });
  }

  const product = pending[0];

  try {
    const trContent = {
      shortDescription: product.content?.tr?.shortDescription ?? "",
      description: product.content?.tr?.description ?? "",
      features: product.content?.tr?.features ?? [],
      styling: product.content?.tr?.styling ?? [],
    };

    const [content, { metaTitle, metaDescription }] = await Promise.all([
      translateProductContent(trContent),
      translateMeta(product.name, trContent.shortDescription || trContent.description.slice(0, 100)),
    ]);

    await updateProduct({
      ...product,
      content: content as typeof product.content,
      metaTitle: metaTitle as typeof product.metaTitle,
      metaDescription: metaDescription as typeof product.metaDescription,
      translationStatus: "completed",
    });

    return NextResponse.json({
      processed: 1,
      remaining: pending.length - 1,
      name: product.name,
    });
  } catch (err) {
    console.error("Translation error for", product.id, err);
    return NextResponse.json({ error: "translation_failed", name: product.name }, { status: 500 });
  }
}

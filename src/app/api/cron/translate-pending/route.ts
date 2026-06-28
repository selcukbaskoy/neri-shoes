import { NextRequest, NextResponse } from "next/server";
import { getProducts, updateProduct } from "@/lib/products";
import { translateProductContent, translateMeta } from "@/lib/translate";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const products = await getProducts();
  const pending = products.filter((p) => p.translationStatus === "pending");

  if (pending.length === 0) {
    return NextResponse.json({ processed: 0, remaining: 0 });
  }

  const toProcess = pending.slice(0, 2);
  let processed = 0;

  for (const product of toProcess) {
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

      processed++;
    } catch (err) {
      console.error("Cron translation error for", product.id, err);
    }
  }

  return NextResponse.json({
    processed,
    remaining: pending.length - processed,
  });
}

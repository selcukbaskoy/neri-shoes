// Instagram Graph API client — sadece kendi NeriShoes business hesabi icin.
// Gerekli env: INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ACCOUNT_ID (.env.local)

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

export interface InstagramMediaItem {
  id: string;
  caption: string | null;
  media_type: InstagramMediaType;
  media_url: string | null;
  permalink: string | null;
  timestamp: string;
  children?: { data: { media_url: string }[] };
}

interface InstagramMediaResponse {
  data: InstagramMediaItem[];
  error?: { message: string };
}

function getConfig() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  if (!accessToken || !businessAccountId) {
    throw new Error(
      "INSTAGRAM_ACCESS_TOKEN veya INSTAGRAM_BUSINESS_ACCOUNT_ID env degiskeni tanimli degil."
    );
  }
  return { accessToken, businessAccountId };
}

// Bir postun tum gorsel URL'lerini doner (carousel ise cocuklari, tek gorsel ise kendisi).
function extractImageUrls(item: InstagramMediaItem): string[] {
  if (item.media_type === "CAROUSEL_ALBUM" && item.children?.data?.length) {
    return item.children.data.map((c) => c.media_url).filter(Boolean);
  }
  if (item.media_type === "IMAGE" && item.media_url) {
    return [item.media_url];
  }
  return [];
}

export interface FetchedInstagramPost {
  ig_media_id: string;
  caption: string | null;
  permalink: string | null;
  media_type: InstagramMediaType;
  image_urls: string[];
  timestamp: string;
}

// Son postlari ceker (video haric — sadece IMAGE/CAROUSEL_ALBUM, urun fotografi olabilecekler).
export async function fetchInstagramMedia(limit = 25): Promise<FetchedInstagramPost[]> {
  const { accessToken, businessAccountId } = getConfig();

  const fields =
    "id,caption,media_type,media_url,permalink,timestamp,children{media_url}";
  const url = `${GRAPH_API_BASE}/${businessAccountId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`;

  const res = await fetch(url, { cache: "no-store" });
  const json: InstagramMediaResponse = await res.json();

  if (!res.ok || json.error) {
    throw new Error(`Instagram Graph API hatasi: ${json.error?.message || res.statusText}`);
  }

  return (json.data || [])
    .filter((item) => item.media_type === "IMAGE" || item.media_type === "CAROUSEL_ALBUM")
    .map((item) => ({
      ig_media_id: item.id,
      caption: item.caption,
      permalink: item.permalink,
      media_type: item.media_type,
      image_urls: extractImageUrls(item),
      timestamp: item.timestamp,
    }))
    .filter((post) => post.image_urls.length > 0);
}

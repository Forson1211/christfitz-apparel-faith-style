// Maps short image codes (stored in DB) to bundled assets.
// Falls back to the raw URL for admin-uploaded images from Supabase Storage.
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import p7 from "@/assets/p7.jpg";
import p8 from "@/assets/p8.jpg";
import hero from "@/assets/hero.jpg";
import about from "@/assets/about.jpg";
import tees from "@/assets/collection-tees.jpg";
import essentials from "@/assets/collection-essentials.jpg";
import premium from "@/assets/collection-premium.jpg";

const map: Record<string, string> = {
  "p1.jpg": p1, "p2.jpg": p2, "p3.jpg": p3, "p4.jpg": p4,
  "p5.jpg": p5, "p6.jpg": p6, "p7.jpg": p7, "p8.jpg": p8,
  "hero.jpg": hero, "about.jpg": about,
  "collection-tees.jpg": tees,
  "collection-essentials.jpg": essentials,
  "collection-premium.jpg": premium,
};

export function resolveImage(url: string | null | undefined): string {
  if (!url) return p1;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    // console.log("[resolveImage] Found absolute URL:", url);
    return url;
  }
  const resolved = map[url] ?? url;
  // console.log("[resolveImage] Resolved", url, "to", resolved);
  return resolved;
}

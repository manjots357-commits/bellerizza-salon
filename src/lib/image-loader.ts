"use client";

type LoaderArgs = { src: string; width: number; quality?: number };

/**
 * next/image loader. Unsplash URLs are resized on the Unsplash (imgix) CDN,
 * which also negotiates AVIF/WebP via `auto=format`. Local files pass through.
 */
export default function imageLoader({ src, width, quality }: LoaderArgs): string {
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "max");
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 72));
    return url.toString();
  }
  return src;
}

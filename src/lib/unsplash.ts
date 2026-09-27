/** Build a fixed-size crop URL from an Unsplash source, e.g. for Open Graph. */
export function unsplashCrop(src: string, w: number, h: number): string {
  if (!src.startsWith("https://images.unsplash.com/")) return src;
  const url = new URL(src);
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "crop");
  url.searchParams.set("w", String(w));
  url.searchParams.set("h", String(h));
  url.searchParams.set("q", "75");
  return url.toString();
}

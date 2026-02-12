export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function spotUrl(locale: string, slug: string): string {
  return `/${locale}/spots/${slug}`;
}

export function mapUrl(
  locale: string,
  params?: Record<string, string>
): string {
  const base = `/${locale}`;
  if (!params) return base;
  const searchParams = new URLSearchParams(params);
  return `${base}?${searchParams.toString()}`;
}

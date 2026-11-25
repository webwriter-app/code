/** Keep older drawer translations as a fallback when the catalog lacks a message. */
export function drawerLabel(translated: string, previous: Record<string, string>, locale: string) {
  const key = Object.keys(previous).find(key => key.toLowerCase() === locale.toLowerCase());
  const fallback = (key ? previous[key] : undefined) ?? previous[locale.split("-")[0] ?? ""];
  return { _: translated === previous["en"] ? fallback ?? translated : translated };
}

/**
 * SEO single source of truth (SEO Operating System — see docs/seo/).
 *
 * Deterministic only: canonical URLs, indexable route list, alias map,
 * brand entity, and schema built from verified facts. No LLM involvement.
 */

export const SITE_URL = "https://thaihora.app";
export const BRAND_NAME = "Horathai AI";
export const SITE_LOCALE = "th_TH";
export const DEFAULT_OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6f7002dc-d294-4766-9be5-fefd41b05e93/id-preview-7292ccd7--ecf265fa-3f17-4a6f-bd0f-9ae9819e8573.lovable.app-1785822934901.png";

/**
 * Static public pages that are server-rendered, self-canonical and indexable.
 * The sitemap is generated from this list + published blog posts.
 * Never add redirect aliases (/chart, /transit, /ai) or app/auth routes here.
 */
export const INDEXABLE_STATIC_PATHS = [
  "/",
  "/blog",
  "/service-info",
  "/terms",
  "/privacy",
] as const;

/**
 * Legacy aliases kept alive for LINE rich-menu links. They redirect, so they must
 * never appear in the sitemap or be used as internal link targets.
 */
export const ROUTE_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  "/chart": "/birth-chart",
  "/transit": "/transits",
  "/ai": "/ai-astrologer",
});

export function canonicalUrl(path: string): string {
  const clean = path.split(/[?#]/)[0] || "/";
  const withSlash = clean.startsWith("/") ? clean : `/${clean}`;
  const trimmed = withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : "/";
  return trimmed === "/" ? `${SITE_URL}/` : `${SITE_URL}${trimmed}`;
}

/** Map an internal href to its canonical target (keeps query/hash). */
export function canonicalHref(href: string): string {
  const m = /^(\/[^?#]*)(.*)$/.exec(href);
  if (!m) return href;
  const path = m[1]!.length > 1 ? m[1]!.replace(/\/+$/, "") : m[1]!;
  const target = ROUTE_ALIASES[path];
  return target ? `${target}${m[2] ?? ""}` : href;
}

type Meta = Record<string, string>;

/** Standard head for an indexable public page: canonical + matching OG/Twitter. */
export function pageHead(opts: {
  path: string;
  title: string;
  description: string;
  type?: "website" | "article";
  image?: string | null | undefined;
  card?: "summary" | "summary_large_image";
}) {
  const url = canonicalUrl(opts.path);
  const image = opts.image === undefined ? DEFAULT_OG_IMAGE : opts.image;
  const meta: Meta[] = [
    { title: opts.title },
    { name: "description", content: opts.description },
    { name: "robots", content: "index, follow, max-image-preview:large" },
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { property: "og:type", content: opts.type ?? "website" },
    { property: "og:url", content: url },
    { property: "og:site_name", content: BRAND_NAME },
    { property: "og:locale", content: SITE_LOCALE },
    { name: "twitter:card", content: opts.card ?? "summary_large_image" },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: opts.description },
  ];
  if (image)
    meta.push({ property: "og:image", content: image }, { name: "twitter:image", content: image });
  return { meta, links: [{ rel: "canonical", href: url }] };
}

/** Meta for pages that must never be indexed (app, auth, tokens, 404). */
export const NOINDEX_META = { name: "robots", content: "noindex, nofollow" } as const;

/** Serialize JSON-LD safely for a <script> tag. */
export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/** Organization + WebSite entity. Only verified facts: brand name and URL. */
export function siteEntitySchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: BRAND_NAME,
        url: `${SITE_URL}/`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: BRAND_NAME,
        url: `${SITE_URL}/`,
        inLanguage: "th-TH",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: canonicalUrl(it.path),
    })),
  };
}

/**
 * FAQ parity gate: FAQPage schema is only allowed when its questions/answers
 * exactly match the FAQ rendered on the page. Returns false on any mismatch.
 */
export function faqSchemaMatchesVisible(
  schema: unknown,
  visible: Array<{ q: string; a: string }>,
): boolean {
  if (!schema || typeof schema !== "object") return false;
  const entities = (schema as { mainEntity?: unknown }).mainEntity;
  if (!Array.isArray(entities) || entities.length !== visible.length) return false;
  const norm = (s: unknown) =>
    String(s ?? "")
      .replace(/\s+/g, " ")
      .trim();
  return entities.every((e, i) => {
    const q = norm((e as { name?: unknown })?.name);
    const a = norm((e as { acceptedAnswer?: { text?: unknown } })?.acceptedAnswer?.text);
    return q === norm(visible[i]!.q) && a === norm(visible[i]!.a);
  });
}

/** Unicode-safe heading id that keeps Thai vowel/tone marks. */
export function headingId(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

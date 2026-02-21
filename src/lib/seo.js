const SITE_NAME = "SupaSecure";
const DEFAULT_IMAGE_PATH = "/Supasecured.jpg";

function upsertMeta({ attribute, key, content }) {
  if (typeof document === "undefined") return;
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content || "");
}

function upsertLink({ rel, href }) {
  if (typeof document === "undefined") return;
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function upsertJsonLd(schema) {
  if (typeof document === "undefined") return;
  const id = "seo-jsonld";
  let script = document.getElementById(id);
  if (!schema) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
}

export function applySeo({
  title,
  description,
  canonicalPath = "/",
  robots = "index,follow",
  ogType = "website",
  keywords = "",
  imagePath = DEFAULT_IMAGE_PATH,
  schema = null,
}) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const origin = window.location.origin;
  const canonicalUrl = new URL(canonicalPath, origin).toString();
  const imageUrl = new URL(imagePath || DEFAULT_IMAGE_PATH, origin).toString();

  document.title = title;
  document.documentElement.setAttribute("lang", "en");

  upsertMeta({ attribute: "name", key: "description", content: description });
  upsertMeta({ attribute: "name", key: "robots", content: robots });
  upsertMeta({ attribute: "name", key: "keywords", content: keywords });
  upsertMeta({ attribute: "name", key: "author", content: SITE_NAME });
  upsertMeta({ attribute: "name", key: "application-name", content: SITE_NAME });
  upsertMeta({ attribute: "name", key: "theme-color", content: "#0f172a" });
  upsertMeta({ attribute: "name", key: "twitter:card", content: "summary_large_image" });
  upsertMeta({ attribute: "name", key: "twitter:title", content: title });
  upsertMeta({ attribute: "name", key: "twitter:description", content: description });
  upsertMeta({ attribute: "name", key: "twitter:image", content: imageUrl });

  upsertMeta({ attribute: "property", key: "og:site_name", content: SITE_NAME });
  upsertMeta({ attribute: "property", key: "og:type", content: ogType });
  upsertMeta({ attribute: "property", key: "og:title", content: title });
  upsertMeta({ attribute: "property", key: "og:description", content: description });
  upsertMeta({ attribute: "property", key: "og:url", content: canonicalUrl });
  upsertMeta({ attribute: "property", key: "og:image", content: imageUrl });
  upsertMeta({ attribute: "property", key: "og:image:alt", content: "SupaSecure logo and product branding" });

  upsertLink({ rel: "canonical", href: canonicalUrl });
  upsertLink({ rel: "icon", href: DEFAULT_IMAGE_PATH });

  upsertJsonLd(schema);
}


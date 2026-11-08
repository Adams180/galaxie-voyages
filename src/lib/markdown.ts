import "server-only";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

// Server-side Markdown → sanitized HTML. All article bodies pass through this
// before rendering, so stored Markdown can never inject scripts/handlers.
marked.setOptions({ gfm: true, breaks: true });

const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "p", "a", "ul", "ol", "li", "blockquote",
    "strong", "em", "del", "code", "pre", "hr", "br", "img", "table",
    "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "title"],
    img: ["src", "alt", "title"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer",
      target: "_blank",
    }),
  },
};

/** Render trusted-but-sanitized Markdown to HTML. */
export function renderMarkdown(md: string): string {
  const raw = marked.parse(md ?? "", { async: false }) as string;
  return sanitizeHtml(raw, SANITIZE);
}

/** Plain-text excerpt from Markdown, for list cards and meta descriptions. */
export function excerpt(md: string, max = 180): string {
  const html = marked.parse(md ?? "", { async: false }) as string;
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

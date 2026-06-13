import * as cheerio from "cheerio";

export interface ScrapedContent {
  url: string;
  title: string;
  metaDescription: string;
  headings: string[];
  bodyText: string;
  ctaTexts: string[];
  success: boolean;
  error?: string;
}

const CTA_KEYWORDS = [
  "get started",
  "sign up",
  "contact",
  "book",
  "schedule",
  "buy",
  "order",
  "subscribe",
  "learn more",
  "free",
  "trial",
  "demo",
  "call",
  "apply",
  "join",
  "download",
  "request",
  "quote",
  "consultation",
  "start",
];

/**
 * Lightweight website scraper — fetches homepage HTML and extracts key content.
 * Uses fetch + cheerio. No Puppeteer.
 * Timeout: 10 seconds max.
 */
export async function scrapeWebsite(url: string): Promise<ScrapedContent> {
  const result: ScrapedContent = {
    url,
    title: "",
    metaDescription: "",
    headings: [],
    bodyText: "",
    ctaTexts: [],
    success: false,
  };

  try {
    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      result.error = `HTTP ${response.status}`;
      return result;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script, style, nav, footer noise
    $("script, style, noscript, iframe, svg").remove();

    // Extract title
    result.title = $("title").first().text().trim() || "";

    // Extract meta description
    result.metaDescription =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      "";

    // Extract headings (h1, h2, h3)
    const headings: string[] = [];
    $("h1, h2, h3").each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 200) {
        headings.push(text);
      }
    });
    result.headings = headings.slice(0, 20);

    // Extract visible body text
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    result.bodyText = bodyText.slice(0, 5000); // Cap at 5000 chars

    // Extract CTA text from buttons and action links
    const ctaTexts: string[] = [];
    $("a, button").each((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      if (text.length > 2 && text.length < 60) {
        const isCta = CTA_KEYWORDS.some((kw) => text.includes(kw));
        if (isCta) {
          ctaTexts.push($(el).text().trim());
        }
      }
    });
    result.ctaTexts = Array.from(new Set(ctaTexts)).slice(0, 10);

    result.success = true;
  } catch (err: any) {
    result.error = err.name === "AbortError" ? "Timeout (10s)" : err.message;
  }

  return result;
}

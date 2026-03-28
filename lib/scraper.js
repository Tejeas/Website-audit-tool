/**
 * scraper.js
 * Responsible for fetching a URL and extracting structured, factual metrics.
 * Kept intentionally separate from AI analysis (clean architecture separation).
 */

const axios = require('axios');
const cheerio = require('cheerio');

// CTA-like link text patterns (common marketing CTAs)
const CTA_TEXT_RE = /^(get|start|try|sign up|sign-up|signup|subscribe|contact us?|request|book|schedule|download|learn more|get started|free trial|buy now|shop now|order now|register|join|claim|demo|see how|explore|view|see plans|get a quote|speak to|talk to)/i;
const CTA_CLASS_RE = /\b(btn|button|cta|hero-link|action)\b/i;

/**
 * @param {string} url - Fully-qualified URL to scrape
 * @returns {{ metrics: object, contentData: object, rawHtml: string }}
 */
async function scrapeUrl(url) {
  const startTime = Date.now();

  const response = await axios.get(url, {
    timeout: 20000,
    maxRedirects: 5,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; PageAuditBot/1.0; +https://eight25media.com)',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  const html = response.data;
  const $ = cheerio.load(html);

  // ── Meta ───────────────────────────────────────────────────────────────────
  const metaTitle = $('title').first().text().trim();
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    '';

  // ── Headings ───────────────────────────────────────────────────────────────
  const headingsList = [];
  $('h1, h2, h3').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text) headingsList.push({ tag: el.tagName.toLowerCase(), text });
  });

  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;

  // ── Word count (body text only) ────────────────────────────────────────────
  const $body = $('body').clone();
  $body.find('script, style, noscript, svg, iframe, nav, footer').remove();
  const bodyText = $body.text().replace(/\s+/g, ' ').trim();
  const words = bodyText.split(' ').filter((w) => w.length > 1);
  const wordCount = words.length;

  // ── Links ─────────────────────────────────────────────────────────────────
  const baseHost = new URL(url).hostname.replace(/^www\./, '');
  let internalLinks = 0;
  let externalLinks = 0;
  const seenHrefs = new Set();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')?.trim();
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (seenHrefs.has(href)) return;
    seenHrefs.add(href);

    try {
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
        const norm = href.startsWith('//') ? 'https:' + href : href;
        const linkHost = new URL(norm).hostname.replace(/^www\./, '');
        linkHost === baseHost ? internalLinks++ : externalLinks++;
      } else {
        // relative path → internal
        internalLinks++;
      }
    } catch (_) {
      internalLinks++; // default to internal if parse fails
    }
  });

  // ── Images ────────────────────────────────────────────────────────────────
  const $imgs = $('img');
  const imageCount = $imgs.length;
  let missingAlt = 0;
  $imgs.each((_, el) => {
    const alt = $(el).attr('alt');
    if (alt === undefined || alt.trim() === '') missingAlt++;
  });
  const missingAltPercent =
    imageCount > 0 ? Math.round((missingAlt / imageCount) * 100) : 0;

  // ── CTAs ──────────────────────────────────────────────────────────────────
  const ctaSet = new Set();

  // Native buttons / submit inputs
  $('button, input[type="submit"], input[type="button"]').each((_, el) => {
    ctaSet.add(el);
  });

  // Anchor tags with CTA-like text or class
  $('a').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    const cls = $(el).attr('class') || '';
    if (CTA_TEXT_RE.test(text) || CTA_CLASS_RE.test(cls)) {
      ctaSet.add(el);
    }
  });

  const ctaCount = ctaSet.size;

  // ── Content sample for AI (clean, first 3 500 chars) ──────────────────────
  const contentSample = bodyText.substring(0, 3500);

  const fetchDurationMs = Date.now() - startTime;

  return {
    metrics: {
      wordCount,
      headings: { h1: h1Count, h2: h2Count, h3: h3Count },
      ctaCount,
      links: { internal: internalLinks, external: externalLinks },
      images: { total: imageCount, missingAlt, missingAltPercent },
      meta: {
        title: metaTitle,
        titleLength: metaTitle.length,
        description: metaDescription,
        descriptionLength: metaDescription.length,
      },
    },
    contentData: {
      url,
      headingsList,
      contentSample,
      fetchDurationMs,
    },
  };
}

module.exports = { scrapeUrl };

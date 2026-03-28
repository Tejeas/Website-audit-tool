/**
 * pages/api/audit.js
 *
 * POST /api/audit
 * Body: { url: string }
 *
 * Returns: { url, timestamp, metrics, analysis, promptLog }
 *
 * Architecture:
 *   1. Validate input
 *   2. Scrape URL (lib/scraper.js) → factual metrics + content sample
 *   3. AI Analysis (lib/aiAnalyzer.js) → structured insights grounded in metrics
 *   4. Return combined response (metrics + analysis kept separate in response shape)
 */

import { scrapeUrl } from '../../lib/scraper';
import { analyzeWithAI } from '../../lib/aiAnalyzer';

export const config = {
  api: {
    // Increase body size limit for large HTML pages
    bodyParser: {
      sizeLimit: '2mb',
    },
    // Extend timeout for slow sites + AI call
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // ── 1. Input validation ────────────────────────────────────────────────────
  const { url } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing required field: url' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url.trim());
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only http/https URLs are supported');
    }
  } catch (err) {
    return res.status(400).json({ error: `Invalid URL: ${err.message}` });
  }

  const canonicalUrl = parsedUrl.href;

  try {
    // ── 2. Scrape ────────────────────────────────────────────────────────────
    let scrapeResult;
    try {
      scrapeResult = await scrapeUrl(canonicalUrl);
    } catch (err) {
      const isTimeout = err.code === 'ECONNABORTED' || err.message.includes('timeout');
      const isBlocked = err.response?.status === 403 || err.response?.status === 401;
      return res.status(502).json({
        error: isTimeout
          ? 'The target URL timed out. Try a faster or more accessible page.'
          : isBlocked
          ? 'The target URL blocked our request (403/401). Try a publicly accessible page.'
          : `Failed to fetch URL: ${err.message}`,
      });
    }

    const { metrics, contentData } = scrapeResult;

    // ── 3. AI Analysis ───────────────────────────────────────────────────────
    let aiResult;
    try {
      aiResult = await analyzeWithAI(metrics, contentData);
    } catch (err) {
      return res.status(502).json({
        error: `AI analysis failed: ${err.message}`,
      });
    }

    const { analysis, promptLog } = aiResult;

    // ── 4. Respond ───────────────────────────────────────────────────────────
    return res.status(200).json({
      url: canonicalUrl,
      timestamp: new Date().toISOString(),
      // Factual metrics — clearly separated from AI output
      metrics,
      // AI-generated insights — grounded in metrics above
      analysis,
      // Prompt logs for transparency / auditability
      promptLog,
    });
  } catch (err) {
    console.error('[audit] Unexpected error:', err);
    return res.status(500).json({
      error: `Internal server error: ${err.message}`,
    });
  }
}

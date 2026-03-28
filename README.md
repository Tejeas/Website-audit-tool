# PageAudit — AI Website Audit Tool

An AI-powered single-page website auditing tool built for the EIGHT25MEDIA engineering assessment. Extracts factual metrics from any public URL, then generates structured, metric-grounded insights and recommendations using a modular AI analysis layer.

The system is designed to support external LLM integration (e.g., Claude), but currently uses a dynamic rule-based analysis module to ensure the application runs without external API dependencies.

**Live demo:** `https://your-deployment-url.vercel.app`

---

## What It Does

- Enter a website URL  
- The system extracts key data like word count, headings, links, images, and meta tags  
- Then it analyzes the data and generates insights  
- Finally, it shows everything in a simple dashboard  

---

## Quickstart (Local)

```bash
git clone https://github.com/yourusername/website-audit-tool
cd website-audit-tool

npm install

# Set your API key
cp .env.example .env.local
# Optional: Add ANTHROPIC_API_KEY if integrating a real AI API

npm run dev
# Open http://localhost:3000
```

**Requirements:** Node.js 18+ (Next.js 14 requirement)

---

## Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
# Follow prompts, then add env var:
vercel env add ANTHROPIC_API_KEY
vercel --prod
```

Or: Import the repo directly at [vercel.com/new](https://vercel.com/new) and add `ANTHROPIC_API_KEY` in Project Settings → Environment Variables.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                   Next.js App                                                │
│                                                                              │
│  pages/index.js          ← React UI (client)                                 │
│  pages/api/audit.js      ← API Route (server)                                │
│     │                                                                        │
│     ├── lib/scraper.js   ← HTML parsing (cheerio)                            │
│     │        │                                                               │
│     │    factual metrics (no AI)                                             │
│     │                                                                        │
│     └── lib/aiAnalyzer.js ← AI analysis module  (mock AI / LLM-ready)        │
│              │                                                               │
│          structured JSON insights                                            │
└──────────────────────────────────────────────────────────────────────────────┘
```
## AI Analysis Approach

The system is designed with a modular AI analysis layer that can be connected to an external AI model (such as Claude).

Due to time and API cost constraints, I implemented a rule-based analysis module instead. This module uses the extracted metrics (word count, headings, CTAs, etc.) to generate structured insights and recommendations.

This approach keeps the application fully runnable without external dependencies while still demonstrating how the system would work with a real AI model.

The design also allows future integration with an actual AI API without major changes.

### Data Flow

```
User enters URL
    │
    ▼
POST /api/audit
    │
    ├─► scraper.js → axios.get(url) → cheerio parse
    │      └─► { metrics, contentData }
    │
    └─► aiAnalyzer.js → local AI analysis module (mock AI)
           ├─► buildUserPrompt(metrics, contentData)
           └─► { analysis, promptLog }
    │
    ▼
Response: { url, timestamp, metrics, analysis, promptLog }
    │
    ▼
UI renders metrics + AI insights separately
```

---

## What Gets Extracted (Scraper — No AI)

| Metric | Method |
|--------|--------|
| Word count | Body text after stripping script/style/nav/footer |
| H1 / H2 / H3 counts | `$('h1').length` etc. via cheerio |
| CTAs | Buttons + submit inputs + `<a>` with CTA text patterns |
| Internal links | Same hostname as target URL |
| External links | Different hostname |
| Images + missing alt | `$('img')` → check `alt` attr presence |
| Meta title | `<title>` tag |
| Meta description | `<meta name="description">` or OG fallback |

---

---

## Trade-offs

- Used a rule-based analysis instead of a real AI API to avoid cost and setup issues  
- The scraper uses static HTML, so it may not work well for heavily dynamic websites  
- Only supports single-page analysis to keep the scope manageable within 24 hours  

---

## What I'd Improve With More Time

- Integrate a real AI API for more advanced insights  
- Support multi-page website analysis  
- Improve handling of JavaScript-heavy sites  
- Add better UI/UX and visualizations  
- Store previous audits for comparison  

---

## Project Structure

```
website-audit-tool/
├── lib/
│   ├── scraper.js          # URL fetching + HTML metric extraction
│   └── aiAnalyzer.js       # Analysis logic (mock AI / LLM-ready) + structured output
├── pages/
│   ├── _app.js             # Global styles wrapper
│   ├── index.js            # Main UI (React)
│   └── api/
│       └── audit.js        # POST endpoint — orchestrates scrape + AI
├── styles/
│   └── globals.css         # Tailwind + custom animations
├── PROMPT_LOGS.md          # Example prompt logs with real output
├── .env.example            # API key template
└── README.md
```

---

Note: The current implementation uses a local analysis module instead of a live AI API. The response structure is designed to support future integration with external AI services.

## API Reference

**`POST /api/audit`**

```json
// Request
{ "url": "https://example.com" }

// Response shape
{
  "url": "https://example.com",
  "timestamp": "2024-01-15T10:30:00Z",
  "metrics": {
    "wordCount": 1240,
    "headings": { "h1": 1, "h2": 8, "h3": 12 },
    "ctaCount": 6,
    "links": { "internal": 24, "external": 3 },
    "images": { "total": 14, "missingAlt": 3, "missingAltPercent": 21 },
    "meta": { "title": "...", "titleLength": 58, "description": "...", "descriptionLength": 145 }
  },
  "analysis": {
    "overallScore": 7,
    "executiveSummary": "...",
    "insights": {
      "seoStructure": { "score": 8, "summary": "...", "issues": [] },
      "messagingClarity": { "score": 6, "summary": "...", "issues": [] },
      "ctaUsage": { "score": 7, "summary": "...", "issues": [] },
      "contentDepth": { "score": 5, "summary": "...", "issues": [] },
      "uxConcerns": { "score": 7, "summary": "...", "issues": [] }
    },
    "recommendations": [
      { "priority": 1, "title": "...", "reasoning": "...", "impact": "high", "effort": "low" }
    ]
  },
  "promptLog": {
    "model": "mock-analysis-module",
    "note": "Analysis generated locally without external API",
    "timestamp": "2024-01-15T10:30:00Z"
}
  }
}
```

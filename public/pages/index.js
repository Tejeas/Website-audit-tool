import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 8) return '#C8FF57';   // lime — strong
  if (score >= 6) return '#60A5FA';   // blue — moderate
  if (score >= 4) return '#FBBF24';   // amber — needs work
  return '#F87171';                    // red — poor
}

function scoreBg(score) {
  if (score >= 8) return 'rgba(200,255,87,0.10)';
  if (score >= 6) return 'rgba(96,165,250,0.10)';
  if (score >= 4) return 'rgba(251,191,36,0.10)';
  return 'rgba(248,113,113,0.10)';
}

function impactBadge(impact) {
  const map = {
    high:   { bg: 'rgba(248,113,113,0.15)', color: '#F87171',  label: 'HIGH' },
    medium: { bg: 'rgba(251,191,36,0.15)',  color: '#FBBF24',  label: 'MED' },
    low:    { bg: 'rgba(96,165,250,0.15)',  color: '#60A5FA',  label: 'LOW' },
  };
  return map[impact] || map.low;
}

function effortBadge(effort) {
  const map = {
    low:    { bg: 'rgba(200,255,87,0.12)',  color: '#C8FF57',  label: '● QUICK WIN' },
    medium: { bg: 'rgba(251,191,36,0.12)',  color: '#FBBF24',  label: '◐ MODERATE' },
    high:   { bg: 'rgba(248,113,113,0.12)', color: '#F87171',  label: '● HEAVY LIFT' },
  };
  return map[effort] || map.medium;
}

// ─── Components ───────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, warn, delay = 0 }) {
  return (
    <div
      className="metric-card"
      style={{
        animationDelay: `${delay}s`,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        padding: '18px 20px',
      }}
    >
      <div style={{ color: '#8892A4', fontSize: 10, letterSpacing: '0.12em', fontWeight: 500, textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, color: warn ? '#FBBF24' : '#F0F4FF', fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: '#8892A4', marginTop: 6 }}>{sub}</div>
      )}
    </div>
  );
}

function ScoreBar({ score, label, summary, issues, idx }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100 + idx * 120);
    return () => clearTimeout(t);
  }, [idx]);

  const [open, setOpen] = useState(false);
  const color = scoreColor(score);
  const bg = scoreBg(score);
  const pct = (score / 10) * 100;

  return (
    <div
      style={{
        background: open ? bg : 'rgba(255,255,255,0.025)',
        border: `1px solid ${open ? color + '33' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'background 0.3s, border 0.3s',
        cursor: 'pointer',
      }}
      onClick={() => setOpen(!open)}
    >
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Score circle */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: `2px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          fontWeight: 700, fontSize: 15,
          color, fontFamily: 'IBM Plex Mono, monospace',
        }}>
          {score}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#F0F4FF', marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>
            {label}
          </div>
          {/* Bar */}
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: animated ? `${pct}%` : '0%',
              background: color,
              borderRadius: 2,
              transition: 'width 1.1s cubic-bezier(0.16,1,0.3,1)',
            }} />
          </div>
        </div>

        <div style={{ color: '#8892A4', fontSize: 12, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</div>
      </div>

      {open && (
        <div style={{ padding: '0 18px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: 13, color: '#B0BCCC', lineHeight: 1.7, margin: '12px 0 10px' }}>{summary}</p>
          {issues?.length > 0 && (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {issues.map((issue, i) => (
                <li key={i} style={{
                  fontSize: 12, color: '#8892A4',
                  padding: '4px 0 4px 14px',
                  borderLeft: `2px solid ${color}44`,
                  marginBottom: 4,
                  lineHeight: 1.5,
                }}>
                  {issue}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Recommendation({ rec, index }) {
  const imp = impactBadge(rec.impact);
  const eff = effortBadge(rec.effort);

  return (
    <div style={{
      display: 'flex', gap: 16, alignItems: 'flex-start',
      padding: '16px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      {/* Number */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'rgba(200,255,87,0.1)',
        border: '1px solid rgba(200,255,87,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        fontWeight: 700, fontSize: 13, color: '#C8FF57',
        fontFamily: 'IBM Plex Mono, monospace',
      }}>
        {index + 1}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#F0F4FF', marginBottom: 6, fontFamily: 'Syne, sans-serif' }}>
          {rec.title}
        </div>
        <p style={{ fontSize: 12, color: '#8892A4', lineHeight: 1.6, margin: '0 0 10px' }}>
          {rec.reasoning}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', padding: '3px 8px', borderRadius: 4, background: imp.bg, color: imp.color }}>
            {imp.label} IMPACT
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 4, background: eff.bg, color: eff.color }}>
            {eff.label}
          </span>
        </div>
      </div>
    </div>
  );
}

function MetaField({ label, value, length, idealMin, idealMax }) {
  const status = !value
    ? { text: 'MISSING', color: '#F87171' }
    : length < idealMin
    ? { text: `${length} chars — too short`, color: '#FBBF24' }
    : length > idealMax
    ? { text: `${length} chars — too long`, color: '#FBBF24' }
    : { text: `${length} chars — optimal`, color: '#C8FF57' };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: '#8892A4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
        <span style={{ fontSize: 10, color: status.color, fontWeight: 600 }}>{status.text}</span>
      </div>
      <div style={{
        fontSize: 12, color: value ? '#B0BCCC' : '#8892A4',
        fontStyle: value ? 'normal' : 'italic',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 6, padding: '8px 12px', lineHeight: 1.5,
      }}>
        {value || 'Not set'}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const INSIGHT_LABELS = {
  seoStructure:    'SEO Structure',
  messagingClarity:'Messaging Clarity',
  ctaUsage:        'CTA Usage',
  contentDepth:    'Content Depth',
  uxConcerns:      'UX & Structure',
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const resultsRef = useRef(null);

  async function runAudit(e) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      let target = url.trim();
      if (!target.startsWith('http')) target = 'https://' + target;

      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Audit failed');
      }

      setResult(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const { metrics, analysis } = result || {};

  return (
    <>
      <Head>
        <title>PageAudit — AI Website Analysis</title>
        <meta name="description" content="AI-powered single-page website audit tool" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔍</text></svg>" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#06090F' }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <header style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 32px',
          height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(6,9,15,0.92)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, background: '#C8FF57', borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>
              ⌖
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', color: '#F0F4FF' }}>
              PageAudit
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#8892A4', fontFamily: 'IBM Plex Mono, monospace' }}>
            AI Website Analysis · EIGHT25MEDIA
          </span>
        </header>

        {/* ── Hero / Input ───────────────────────────────────────── */}
        <section style={{ padding: '72px 32px 60px', maxWidth: 740, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            fontSize: 10, letterSpacing: '0.2em', fontWeight: 600,
            color: '#C8FF57', background: 'rgba(200,255,87,0.1)',
            border: '1px solid rgba(200,255,87,0.2)',
            padding: '4px 12px', borderRadius: 20, marginBottom: 24,
          }}>
            SINGLE PAGE ANALYSIS
          </div>

          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.1,
            color: '#F0F4FF', margin: '0 0 18px',
            letterSpacing: '-0.03em',
          }}>
            Audit any webpage.<br />
            <span style={{ color: '#C8FF57' }}>Get AI-grounded insights.</span>
          </h1>

          <p style={{ color: '#8892A4', fontSize: 15, lineHeight: 1.7, margin: '0 0 40px', fontFamily: 'IBM Plex Mono, monospace' }}>
            Extracts SEO metrics, CTA counts, and content signals — then generates<br />
            specific, metric-grounded recommendations via AI.
          </p>

          {/* URL form */}
          <form onSubmit={runAudit} style={{ display: 'flex', gap: 12, maxWidth: 600, margin: '0 auto' }}>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={loading}
              style={{
                flex: 1, padding: '14px 18px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, color: '#F0F4FF',
                fontFamily: 'IBM Plex Mono, monospace', fontSize: 14,
                outline: 'none',
                transition: 'border 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(200,255,87,0.4)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              style={{
                padding: '14px 24px',
                background: loading ? 'rgba(200,255,87,0.3)' : '#C8FF57',
                color: '#06090F', fontWeight: 700,
                fontFamily: 'Syne, sans-serif', fontSize: 14,
                border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
                minWidth: 120,
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 14, height: 14, border: '2px solid #06090F33',
                    borderTopColor: '#06090F', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }} />
                  Auditing…
                </span>
              ) : 'Run Audit →'}
            </button>
          </form>

          {loading && (
            <p style={{ marginTop: 20, fontSize: 12, color: '#8892A4', fontFamily: 'IBM Plex Mono, monospace' }}>
              Fetching page → extracting metrics → running AI analysis…
            </p>
          )}

          {error && (
            <div style={{
              marginTop: 20, padding: '12px 16px',
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.25)',
              borderRadius: 8, color: '#F87171', fontSize: 13,
              fontFamily: 'IBM Plex Mono, monospace',
            }}>
              ✗ {error}
            </div>
          )}
        </section>

        {/* ── Results ────────────────────────────────────────────── */}
        {result && (
          <div ref={resultsRef} style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <div style={{
                fontSize: 11, color: '#C8FF57', fontWeight: 600,
                letterSpacing: '0.15em', padding: '4px 14px',
                border: '1px solid rgba(200,255,87,0.25)', borderRadius: 20,
              }}>
                AUDIT COMPLETE
              </div>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* URL + timestamp */}
            <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 13, color: '#8892A4', fontFamily: 'IBM Plex Mono, monospace' }}>
                <span style={{ color: '#C8FF57' }}>⌖</span>{' '}
                <a href={result.url} target="_blank" rel="noreferrer" style={{ color: '#60A5FA', textDecoration: 'none' }}>
                  {result.url}
                </a>
              </div>
              <div style={{ fontSize: 11, color: '#4A5568', fontFamily: 'IBM Plex Mono, monospace' }}>
                {new Date(result.timestamp).toLocaleString()}
              </div>
            </div>

            {/* Executive Summary */}
            {analysis?.executiveSummary && (
              <div style={{
                background: 'rgba(200,255,87,0.05)',
                border: '1px solid rgba(200,255,87,0.15)',
                borderRadius: 12, padding: '20px 24px', marginBottom: 40,
                display: 'flex', gap: 16, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: 'rgba(200,255,87,0.15)',
                  border: '1px solid rgba(200,255,87,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, flexDirection: 'column',
                }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#C8FF57', fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1 }}>
                    {analysis.overallScore}
                  </span>
                  <span style={{ fontSize: 9, color: '#8A9260', letterSpacing: '0.08em' }}>/10</span>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#8A9260', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 8 }}>EXECUTIVE SUMMARY</div>
                  <p style={{ fontSize: 14, color: '#B0BCCC', lineHeight: 1.7, margin: 0 }}>
                    {analysis.executiveSummary}
                  </p>
                </div>
              </div>
            )}

            {/* Two column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

              {/* Left: Factual Metrics */}
              <div>
                <SectionLabel>FACTUAL METRICS</SectionLabel>
                <p style={{ fontSize: 11, color: '#4A5568', marginBottom: 20, fontFamily: 'IBM Plex Mono, monospace' }}>
                  Extracted directly from page HTML — no AI involved
                </p>

                {/* Metric cards grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <MetricCard label="Word Count" value={metrics.wordCount.toLocaleString()} delay={0.05} />
                  <MetricCard label="H1 / H2 / H3" value={`${metrics.headings.h1} · ${metrics.headings.h2} · ${metrics.headings.h3}`} delay={0.10} />
                  <MetricCard label="CTAs" value={metrics.ctaCount} delay={0.15}
                    warn={metrics.ctaCount < 2}
                    sub={metrics.ctaCount < 2 ? 'Low — consider more CTAs' : undefined}
                  />
                  <MetricCard label="Links" value={`${metrics.links.internal}i · ${metrics.links.external}e`}
                    sub={`${metrics.links.internal} internal, ${metrics.links.external} external`} delay={0.20}
                  />
                  <MetricCard label="Images" value={metrics.images.total} delay={0.25} />
                  <MetricCard label="Missing Alt" value={`${metrics.images.missingAltPercent}%`}
                    warn={metrics.images.missingAltPercent > 20}
                    sub={`${metrics.images.missingAlt} of ${metrics.images.total} imgs`} delay={0.30}
                  />
                </div>

                {/* Meta */}
                <div style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10, padding: '16px 18px',
                }}>
                  <div style={{ fontSize: 10, color: '#8892A4', letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase', marginBottom: 14 }}>
                    Meta Tags
                  </div>
                  <MetaField
                    label="Title" value={metrics.meta.title}
                    length={metrics.meta.titleLength} idealMin={50} idealMax={60}
                  />
                  <MetaField
                    label="Description" value={metrics.meta.description}
                    length={metrics.meta.descriptionLength} idealMin={140} idealMax={160}
                  />
                </div>
              </div>

              {/* Right: AI Insights */}
              <div>
                <SectionLabel>AI INSIGHTS</SectionLabel>
                <p style={{ fontSize: 11, color: '#4A5568', marginBottom: 20, fontFamily: 'IBM Plex Mono, monospace' }}>
                  Grounded in the metrics above — click to expand
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {analysis?.insights && Object.entries(INSIGHT_LABELS).map(([key, label], idx) => {
                    const insight = analysis.insights[key];
                    if (!insight) return null;
                    return (
                      <ScoreBar
                        key={key} idx={idx}
                        score={insight.score}
                        label={label}
                        summary={insight.summary}
                        issues={insight.issues}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {analysis?.recommendations?.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <SectionLabel>PRIORITIZED RECOMMENDATIONS</SectionLabel>
                <p style={{ fontSize: 11, color: '#4A5568', marginBottom: 20, fontFamily: 'IBM Plex Mono, monospace' }}>
                  Ordered by business impact — each tied to specific metrics
                </p>

                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12, padding: '8px 20px',
                }}>
                  {analysis.recommendations.map((rec, i) => (
                    <Recommendation key={i} rec={rec} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Prompt Logs */}
            <div style={{ marginTop: 40 }}>
              <button
                onClick={() => setShowLogs(!showLogs)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
                  color: '#8892A4', fontSize: 12, fontFamily: 'IBM Plex Mono, monospace',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ color: '#C8FF57' }}>⊞</span>
                {showLogs ? 'Hide' : 'Show'} Prompt Logs / Reasoning Trace
                <span style={{ marginLeft: 4, transform: showLogs ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.2s' }}>▾</span>
              </button>

              {showLogs && result.promptLog && (
                <div style={{ marginTop: 16 }}>
                  <LogBlock label="SYSTEM PROMPT" content={result.promptLog.systemPrompt} />
                  <LogBlock label="USER PROMPT (STRUCTURED INPUT)" content={result.promptLog.userPrompt} />
                  <LogBlock label="RAW MODEL OUTPUT" content={result.promptLog.rawOutput} />
                  <div style={{
                    fontSize: 11, color: '#8892A4', fontFamily: 'IBM Plex Mono, monospace',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 6, marginTop: 8,
                  }}>
                    Model: {result.promptLog.model} ·
                    Input tokens: {result.promptLog.usage?.inputTokens} ·
                    Output tokens: {result.promptLog.usage?.outputTokens} ·
                    AI time: {result.promptLog.aiDurationMs}ms
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #4A5568; }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

// ─── Small helpers ──────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
      color: '#C8FF57', textTransform: 'uppercase',
      marginBottom: 6, fontFamily: 'IBM Plex Mono, monospace',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ display: 'inline-block', width: 20, height: 1, background: '#C8FF57' }} />
      {children}
    </div>
  );
}

function LogBlock({ label, content }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, color: '#8892A4', letterSpacing: '0.1em', marginBottom: 4, fontFamily: 'IBM Plex Mono, monospace' }}>
        // {label}
      </div>
      <pre style={{
        margin: 0, padding: '14px 16px',
        background: '#080C14', border: '1px solid #1E2A40',
        borderRadius: 8, fontSize: 11, color: '#6A8A9A',
        lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        maxHeight: 320, overflowY: 'auto',
        fontFamily: 'IBM Plex Mono, monospace',
      }}>
        {content}
      </pre>
    </div>
  );
}

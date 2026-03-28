/**
 * aiAnalyzer.js
 * Mock AI layer for demo/submission use.
 * Generates structured insights from scraped metrics without calling an external API.
 */

function clampScore(score) {
  return Math.max(1, Math.min(10, Math.round(score)));
}

function getMetaStatus(length, min, max) {
  if (!length) return 'missing';
  if (length < min) return 'short';
  if (length > max) return 'long';
  return 'good';
}

function buildIssues(metrics) {
  const issues = {
    seoStructure: [],
    messagingClarity: [],
    ctaUsage: [],
    contentDepth: [],
    uxConcerns: [],
  };

  const { wordCount, headings, ctaCount, links, images, meta } = metrics;

  // SEO structure
  if (headings.h1 === 0) {
    issues.seoStructure.push('No H1 tag detected, which weakens the page’s main SEO signal.');
  } else if (headings.h1 > 1) {
    issues.seoStructure.push(`There are ${headings.h1} H1 tags. Multiple H1s can dilute page structure.`);
  } else {
    issues.seoStructure.push('A single H1 is present, which is a strong structural signal.');
  }

  if (headings.h2 < 2) {
    issues.seoStructure.push(`Only ${headings.h2} H2 tags were found, so section structure may feel shallow.`);
  }

  if (meta.titleLength < 50) {
    issues.seoStructure.push(`Meta title is ${meta.titleLength} characters, which is shorter than the ideal range.`);
  } else if (meta.titleLength > 60) {
    issues.seoStructure.push(`Meta title is ${meta.titleLength} characters, which may be too long for search results.`);
  } else {
    issues.seoStructure.push(`Meta title length is ${meta.titleLength}, which is within the ideal range.`);
  }

  if (meta.descriptionLength < 140) {
    issues.seoStructure.push(`Meta description is ${meta.descriptionLength} characters, so it may not fully use search snippet space.`);
  } else if (meta.descriptionLength > 160) {
    issues.seoStructure.push(`Meta description is ${meta.descriptionLength} characters, which may get truncated in search results.`);
  }

  // Messaging clarity
  if (wordCount < 400) {
    issues.messagingClarity.push(`The page has only ${wordCount} words, which may not be enough to explain value clearly.`);
  } else if (wordCount < 800) {
    issues.messagingClarity.push(`At ${wordCount} words, the messaging is likely concise but may still need more detail.`);
  } else {
    issues.messagingClarity.push(`The page has ${wordCount} words, which gives reasonable room to explain the offer.`);
  }

  if (headings.h2 === 0 && headings.h3 === 0) {
    issues.messagingClarity.push('There are no supporting H2 or H3 sections, so the message may feel flat.');
  }

  // CTA usage
  if (ctaCount === 0) {
    issues.ctaUsage.push('No CTA elements were detected, so users may not have a clear next step.');
  } else if (ctaCount < 3) {
    issues.ctaUsage.push(`Only ${ctaCount} CTA element(s) were found, so conversion opportunities may be limited.`);
  } else {
    issues.ctaUsage.push(`${ctaCount} CTA elements were found, which gives users multiple conversion points.`);
  }

  if (wordCount > 0 && ctaCount > 0) {
    const wordsPerCTA = Math.round(wordCount / ctaCount);
    if (wordsPerCTA > 180) {
      issues.ctaUsage.push(`There is about 1 CTA per ${wordsPerCTA} words, which is sparse for a conversion-focused page.`);
    }
  }

  // Content depth
  if (wordCount < 600) {
    issues.contentDepth.push(`Word count is ${wordCount}, which suggests thin content for a competitive marketing page.`);
  } else if (wordCount < 1000) {
    issues.contentDepth.push(`Word count is ${wordCount}, which is decent but could be expanded for stronger depth.`);
  } else {
    issues.contentDepth.push(`Word count is ${wordCount}, which provides solid content depth.`);
  }

  if (headings.h3 > headings.h2 * 3 && headings.h2 > 0) {
    issues.contentDepth.push(`There are ${headings.h3} H3 tags compared with ${headings.h2} H2 tags, so some sections may be fragmented.`);
  }

  // UX concerns
  if (images.total > 0) {
    if (images.missingAlt > 0) {
      issues.uxConcerns.push(
        `${images.missingAlt} of ${images.total} images are missing alt text (${images.missingAltPercent}%), which affects accessibility.`
      );
    } else {
      issues.uxConcerns.push(`All ${images.total} images have alt text, which is strong for accessibility.`);
    }
  }

  if (links.external === 0) {
    issues.uxConcerns.push('No external links were detected, so the page may feel a bit closed or self-contained.');
  }

  if (links.internal < 3) {
    issues.uxConcerns.push(`Only ${links.internal} internal links were found, which may limit navigation pathways.`);
  }

  return issues;
}

function buildScores(metrics) {
  const { wordCount, headings, ctaCount, images, meta } = metrics;

  let seoScore = 7;
  if (headings.h1 === 1) seoScore += 1;
  if (headings.h1 === 0 || headings.h1 > 1) seoScore -= 2;
  if (meta.titleLength >= 50 && meta.titleLength <= 60) seoScore += 1;
  else seoScore -= 1;
  if (meta.descriptionLength >= 140 && meta.descriptionLength <= 160) seoScore += 1;
  else seoScore -= 1;

  let messagingScore = 6;
  if (wordCount >= 800) messagingScore += 1;
  if (wordCount >= 1200) messagingScore += 1;
  if (wordCount < 500) messagingScore -= 2;

  let ctaScore = 5;
  if (ctaCount >= 3) ctaScore += 2;
  if (ctaCount >= 5) ctaScore += 1;
  if (ctaCount === 0) ctaScore -= 3;

  let depthScore = 5;
  if (wordCount >= 700) depthScore += 1;
  if (wordCount >= 1000) depthScore += 2;
  if (wordCount < 500) depthScore -= 2;

  let uxScore = 7;
  if (images.total > 0 && images.missingAltPercent >= 25) uxScore -= 2;
  else if (images.total > 0 && images.missingAltPercent > 0) uxScore -= 1;

  return {
    seoStructure: clampScore(seoScore),
    messagingClarity: clampScore(messagingScore),
    ctaUsage: clampScore(ctaScore),
    contentDepth: clampScore(depthScore),
    uxConcerns: clampScore(uxScore),
  };
}

function buildSummaries(metrics, scores) {
  const { wordCount, headings, ctaCount, images, meta } = metrics;

  return {
    seoStructure:
      `The page has ${headings.h1} H1 tag(s), ${headings.h2} H2 tag(s), and ${headings.h3} H3 tag(s). ` +
      `The meta title is ${meta.titleLength} characters and the meta description is ${meta.descriptionLength} characters.`,

    messagingClarity:
      `The page contains ${wordCount} words, which gives a ${scores.messagingClarity >= 7 ? 'fairly strong' : 'limited'} amount of room ` +
      `to communicate value and explain the offer clearly.`,

    ctaUsage:
      `The page has ${ctaCount} CTA element(s). ` +
      `${ctaCount >= 3 ? 'That gives users multiple next steps.' : 'That may not be enough to guide users confidently.'}`,

    contentDepth:
      `With ${wordCount} words and a heading structure of ${headings.h2} H2s / ${headings.h3} H3s, ` +
      `the content depth appears ${scores.contentDepth >= 7 ? 'reasonably strong' : 'somewhat limited'}.`,

    uxConcerns:
      `The page contains ${images.total} image(s), and ${images.missingAlt} are missing alt text. ` +
      `This creates ${images.missingAlt > 0 ? 'an accessibility gap' : 'a solid accessibility baseline'} for visual content.`,
  };
}

function buildRecommendations(metrics) {
  const recs = [];
  const { wordCount, ctaCount, images, meta, headings } = metrics;

  if (ctaCount < 3) {
    recs.push({
      priority: recs.length + 1,
      title: 'Add more visible calls to action',
      reasoning: `Only ${ctaCount} CTA element(s) were detected, so users may not have enough prompts to take action.`,
      impact: 'high',
      effort: 'low',
    });
  }

  if (meta.descriptionLength < 140 || meta.descriptionLength > 160) {
    recs.push({
      priority: recs.length + 1,
      title: 'Improve the meta description length',
      reasoning: `The current meta description is ${meta.descriptionLength} characters, which is outside the ideal 140–160 range.`,
      impact: 'high',
      effort: 'low',
    });
  }

  if (wordCount < 1000) {
    recs.push({
      priority: recs.length + 1,
      title: 'Expand page content for more depth',
      reasoning: `The page has ${wordCount} words, so adding more useful copy could improve clarity, SEO relevance, and trust.`,
      impact: 'high',
      effort: 'medium',
    });
  }

  if (images.missingAlt > 0) {
    recs.push({
      priority: recs.length + 1,
      title: 'Add alt text to missing images',
      reasoning: `${images.missingAlt} image(s) are missing alt text, which affects accessibility and weakens image SEO.`,
      impact: 'medium',
      effort: 'low',
    });
  }

  if (headings.h1 !== 1) {
    recs.push({
      priority: recs.length + 1,
      title: 'Fix the H1 structure',
      reasoning: `The page currently has ${headings.h1} H1 tag(s), while most pages perform best with one clear primary H1.`,
      impact: 'medium',
      effort: 'low',
    });
  }

  if (recs.length === 0) {
    recs.push({
      priority: 1,
      title: 'Fine-tune copy and conversion pathways',
      reasoning: 'The page metrics are fairly healthy overall, so the next gains will likely come from testing sharper messaging and stronger CTA placement.',
      impact: 'medium',
      effort: 'medium',
    });
  }

  return recs.slice(0, 5);
}

function buildExecutiveSummary(metrics, scores) {
  const overall =
    clampScore(
      (scores.seoStructure +
        scores.messagingClarity +
        scores.ctaUsage +
        scores.contentDepth +
        scores.uxConcerns) / 5
    );

  const strengths = [];
  const weaknesses = [];

  if (scores.seoStructure >= 7) strengths.push('SEO structure');
  else weaknesses.push('SEO structure');

  if (scores.ctaUsage >= 7) strengths.push('CTA coverage');
  else weaknesses.push('CTA usage');

  if (scores.contentDepth >= 7) strengths.push('content depth');
  else weaknesses.push('content depth');

  const summary =
    `This page scores ${overall}/10 overall. ` +
    `${strengths.length ? `Its stronger areas are ${strengths.join(', ')}. ` : ''}` +
    `${weaknesses.length ? `The main improvement areas are ${weaknesses.join(', ')}. ` : ''}` +
    `The analysis is based on ${metrics.wordCount} words, ${metrics.ctaCount} CTA element(s), ` +
    `${metrics.headings.h1} H1 tag(s), and ${metrics.images.missingAlt} image(s) missing alt text.`;

  return { overall, summary };
}

async function analyzeWithAI(metrics, contentData) {
  const scores = buildScores(metrics);
  const issues = buildIssues(metrics);
  const summaries = buildSummaries(metrics, scores);
  const recommendations = buildRecommendations(metrics);
  const executive = buildExecutiveSummary(metrics, scores);

  const analysis = {
    overallScore: executive.overall,
    executiveSummary: executive.summary,
    insights: {
      seoStructure: {
        score: scores.seoStructure,
        summary: summaries.seoStructure,
        issues: issues.seoStructure,
      },
      messagingClarity: {
        score: scores.messagingClarity,
        summary: summaries.messagingClarity,
        issues: issues.messagingClarity,
      },
      ctaUsage: {
        score: scores.ctaUsage,
        summary: summaries.ctaUsage,
        issues: issues.ctaUsage,
      },
      contentDepth: {
        score: scores.contentDepth,
        summary: summaries.contentDepth,
        issues: issues.contentDepth,
      },
      uxConcerns: {
        score: scores.uxConcerns,
        summary: summaries.uxConcerns,
        issues: issues.uxConcerns,
      },
    },
    recommendations,
  };

  const promptLog = {
    model: 'mock-dynamic-analyzer',
    timestamp: new Date().toISOString(),
    note: 'Dynamic mock analysis generated locally from scraped metrics without an external LLM call.',
    inputSnapshot: {
      url: contentData?.url || '',
      wordCount: metrics.wordCount,
      headings: metrics.headings,
      ctaCount: metrics.ctaCount,
      links: metrics.links,
      images: metrics.images,
      meta: metrics.meta,
    },
  };

  return { analysis, promptLog };
}

module.exports = { analyzeWithAI };
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Try models in order until one works
async function ask(prompt) {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-2.0-flash-001'];
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.log(`Model ${modelName} failed, trying next...`);
    }
  }
  throw new Error('All models failed');
}

// ---------------------------------------------------------------
// POST /api/ai/autofill
// Body: { url: string }
// Scrapes the job URL and extracts structured job info
// ---------------------------------------------------------------
router.post('/autofill', auth, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    // Fetch the page HTML
    const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
    let pageText = '';
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 8000,
      });
      const html = await response.text();
      // Strip HTML tags to get plain text
      pageText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 6000);
    } catch {
      return res.status(422).json({ error: 'Could not fetch the job page. Try adding the job manually.' });
    }

    const prompt = `
You are a job listing parser. Extract structured information from the following job page text.

Job page content:
"""
${pageText}
"""

Return ONLY a valid JSON object with these exact keys (no markdown, no explanation):
{
  "company": "company name",
  "role": "job title",
  "jobUrl": "${url}",
  "notes": "2-3 sentence summary of the role, key requirements, and any salary info if mentioned"
}

If a field cannot be determined, use an empty string.
`.trim();

    const text = await ask(prompt);

    // Strip markdown code fences if Gemini adds them
    const clean = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean);

    res.json(data);
  } catch (err) {
    console.error('Autofill error:', err.message);
    res.status(500).json({ error: 'AI autofill failed. Please add the job manually.' });
  }
});

// ---------------------------------------------------------------
// POST /api/ai/match
// Body: { jd: string, resume: string }
// Scores resume against job description
// ---------------------------------------------------------------
router.post('/match', auth, async (req, res) => {
  const { jd, resume } = req.body;
  if (!jd || !resume) return res.status(400).json({ error: 'Both job description and resume are required' });

  try {
    const prompt = `
You are an expert technical recruiter and career coach helping a CS graduate in India target product startups (5–8 LPA range).

Job Description:
"""
${jd.slice(0, 3000)}
"""

Candidate Resume:
"""
${resume.slice(0, 3000)}
"""

Analyse the match and respond with a clear, honest assessment in this exact format:

MATCH SCORE: [X]%

STRENGTHS (what aligns well):
- [point]
- [point]
- [point]

GAPS (what's missing or weak):
- [point]
- [point]

WHAT TO HIGHLIGHT in your application/interview:
- [point]
- [point]

VERDICT: [1-2 sentence honest summary — should they apply, and what's their realistic chance?]
`.trim();

    const result = await ask(prompt);
    res.json({ result });
  } catch (err) {
    console.error('Match error:', err.message);
    res.status(500).json({ error: 'Match scoring failed. Please try again.' });
  }
});

// ---------------------------------------------------------------
// POST /api/ai/suggest
// Body: { applications: array }
// Reviews all applications and gives smart next-action suggestions
// ---------------------------------------------------------------
router.post('/suggest', auth, async (req, res) => {
  const { applications } = req.body;
  if (!applications || applications.length === 0) {
    return res.json({ suggestions: [] });
  }

  try {
    // Build a compact summary of each application
    const appSummary = applications.map(a => {
      const days = Math.floor((Date.now() - new Date(a.createdAt)) / 86400000);
      return `- ${a.company} | ${a.role} | Status: ${a.status} | Applied ${days} day(s) ago${a.notes ? ` | Notes: ${a.notes.slice(0, 80)}` : ''}`;
    }).join('\n');

    const prompt = `
You are a smart job search coach helping a CS graduate in India who is targeting product startups (5–8 LPA).

Here are their current job applications:
${appSummary}

For each application, suggest the single most important action they should take RIGHT NOW based on:
- How many days since they applied
- Their current status
- General best practices (follow up after 5-7 days if Applied, prep hard if Interview, send thank-you if Offer, learn from rejections)

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "company": "Company Name",
    "emoji": "📬",
    "text": "short actionable suggestion (max 12 words)"
  }
]

Use these emojis based on action type:
📬 = follow up email
📚 = interview preparation  
💌 = thank you / negotiation email
🔄 = apply to similar roles
✅ = keep waiting, too early
🎯 = tailor resume before applying again
`.trim();

    const text = await ask(prompt);
    const clean = text.replace(/```json|```/g, '').trim();
    const suggestions = JSON.parse(clean);

    res.json({ suggestions });
  } catch (err) {
    console.error('Suggest error:', err.message);
    res.status(500).json({ error: 'Could not generate suggestions. Please try again.' });
  }
});

module.exports = router;
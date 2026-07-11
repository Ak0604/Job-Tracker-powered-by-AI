import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Evaluate.css';

const CV_CONTENT = `
# Atharva Kadam — CV

Full-Stack Developer | Panvel, Maharashtra | CS Graduate

## Experience
- Reliance Industries — Software Engineering Intern (Current)
  Building internal tools with React and Node.js

## Skills
- Frontend: React.js, HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB
- Tools: Git, Playwright, Claude Code

## Projects
- Job Tracker — Full-stack kanban job application tracker (React, Node.js, Express, MongoDB, Gemini API)
- career-ops — AI job evaluator using Claude Code and Playwright that scores jobs and generates tailored CVs

## Education
- Computer Science Graduate, Maharashtra
`.trim();

const DIMENSIONS = [
  'Tech stack match',
  'Role seniority fit',
  'Domain overlap',
  'Location / remote',
  'Compensation',
  'Growth trajectory',
  'Startup readiness',
  'Interview difficulty',
  'CV keyword match',
  'Mission alignment',
];

const STEPS = [
  'Parsing job description',
  'Loading CV profile',
  'Scoring 10 dimensions',
  'Generating summary',
  'Done',
];

const GEMINI_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
const BACKEND_URL = process.env.REACT_APP_API_URL || 'https://job-tracker-powered-by-ai.onrender.com';

export default function Evaluate() {
const { token } = useAuth();
  const navigate = useNavigate();

  const [url, setUrl] = useState('');
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  async function evaluate() {
    if (!url.trim() && !jd.trim()) return;
    setLoading(true);
    setResult(null);
    setError('');
    setAdded(false);
    setStepIdx(0);

    const input = url.trim()
      ? `Job URL: ${url.trim()}\n\nEvaluate this role.`
      : `Job Description:\n\n${jd.trim()}`;

    const prompt = `You are a career advisor evaluating a job posting against a candidate's CV.

CV:
${CV_CONTENT}

${input}

Score this job against the CV across exactly these 10 dimensions (score each 0.0–5.0):
1. Tech stack match
2. Role seniority fit
3. Domain overlap
4. Location / remote
5. Compensation
6. Growth trajectory
7. Startup readiness
8. Interview difficulty
9. CV keyword match
10. Mission alignment

Also extract: company name, job title, location, salary (if mentioned), key tech tags (max 5).
Write a 2-3 sentence "why this fits" summary and a 1-2 sentence "watch outs" warning.

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "company": "",
  "title": "",
  "location": "",
  "salary": "",
  "tags": [],
  "scores": {
    "Tech stack match": 0.0,
    "Role seniority fit": 0.0,
    "Domain overlap": 0.0,
    "Location / remote": 0.0,
    "Compensation": 0.0,
    "Growth trajectory": 0.0,
    "Startup readiness": 0.0,
    "Interview difficulty": 0.0,
    "CV keyword match": 0.0,
    "Mission alignment": 0.0
  },
  "overall": 0.0,
  "why": "",
  "watchout": ""
}`;

    try {
      setStepIdx(1);
      await delay(500);
      setStepIdx(2);

      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1000 },
        }),
      });

      setStepIdx(3);
      await delay(400);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Gemini API error');
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      setStepIdx(4);
      await delay(300);
      setResult(parsed);
    } catch (e) {
      setError(e.message || 'Something went wrong. Check your REACT_APP_GEMINI_API_KEY.');
    } finally {
      setLoading(false);
    }
  }

  async function addToPipeline() {
    if (!result || !token) return;
    setAdding(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company: result.company,
          position: result.title,
          location: result.location,
          salary: result.salary,
          status: 'Applied',
          notes: `Score: ${result.overall}/5\n\nWhy: ${result.why}\n\nWatch out: ${result.watchout}`,
          url: url.trim() || '',
        }),
      });
      if (!res.ok) throw new Error('Failed to add to pipeline');
      setAdded(true);
    } catch (e) {
      setError('Could not add to pipeline: ' + e.message);
    } finally {
      setAdding(false);
    }
  }

  function scoreColor(s) {
    if (s >= 4.0) return '#27a644';
    if (s >= 3.0) return '#5e6ad2';
    if (s >= 2.0) return '#d4a017';
    return '#c94a4a';
  }

  function overallLabel(s) {
    if (s >= 4.5) return 'Strong fit';
    if (s >= 3.5) return 'Good fit';
    if (s >= 2.5) return 'Partial fit';
    return 'Weak fit';
  }

  function reset() {
    setUrl(''); setJd(''); setResult(null);
    setError(''); setStepIdx(-1); setAdded(false);
  }

  return (
    <div className="ev-page">
      <div className="ev-nav">
        <div className="ev-nav-left">
          <div className="ev-wordmark"><div className="ev-wdot" />Runway</div>
          <div className="ev-nav-links">
            <span className="ev-nl" onClick={() => navigate('/dashboard')}>Pipeline</span>
            <span className="ev-nl ev-nl-active">Evaluate</span>
          </div>
        </div>
        <button className="ev-btn ev-btn-ghost" onClick={() => navigate('/dashboard')}>← Back to pipeline</button>
      </div>

      <div className="ev-body">
        <div className="ev-header">
          <h1 className="ev-title">Evaluate a role</h1>
          <p className="ev-sub">Paste a job URL or description — scored against your CV across 10 dimensions.</p>
        </div>

        {!result && (
          <div className="ev-input-card">
            <div className="ev-field-label">Job URL</div>
            <input
              className="ev-url-input"
              type="text"
              placeholder="https://jobs.lever.co/company/role"
              value={url}
              onChange={e => setUrl(e.target.value)}
              disabled={loading}
            />
            <div className="ev-or">
              <div className="ev-or-line" /><span>or paste job description</span><div className="ev-or-line" />
            </div>
            <textarea
              className="ev-jd-input"
              rows={6}
              placeholder="Paste the full job description here..."
              value={jd}
              onChange={e => setJd(e.target.value)}
              disabled={loading}
            />
            {error && <div className="ev-error">{error}</div>}
            <button
              className="ev-eval-btn"
              onClick={evaluate}
              disabled={loading || (!url.trim() && !jd.trim())}
            >
              {loading ? (
                <span className="ev-btn-inner"><span className="ev-pulse" />{STEPS[stepIdx] || 'Working...'}</span>
              ) : '⚡ Evaluate against my CV'}
            </button>
            {loading && (
              <div className="ev-steps">
                {STEPS.map((s, i) => (
                  <div key={s} className={`ev-step ${i < stepIdx ? 'ev-step-done' : i === stepIdx ? 'ev-step-active' : ''}`}>
                    <span className="ev-step-dot">{i < stepIdx ? '✓' : i === stepIdx ? '·' : '○'}</span>
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="ev-result">
            <div className="ev-result-card">
              <div className="ev-result-top">
                <div className="ev-result-meta">
                  <div className="ev-result-company">{result.company}</div>
                  <div className="ev-result-title">{result.title}</div>
                  <div className="ev-result-tags">
                    {result.location && <span className="ev-tag">{result.location}</span>}
                    {result.salary && <span className="ev-tag">{result.salary}</span>}
                    {result.tags?.map(t => <span key={t} className="ev-tag">{t}</span>)}
                  </div>
                </div>
                <div className="ev-score-big">
                  <div>
                    <span className="ev-score-num" style={{ color: scoreColor(result.overall) }}>
                      {Number(result.overall).toFixed(1)}
                    </span>
                    <span className="ev-score-denom">/5</span>
                  </div>
                  <div className="ev-score-label" style={{ color: scoreColor(result.overall) }}>
                    {overallLabel(result.overall)}
                  </div>
                </div>
              </div>

              <div className="ev-dims-label">Dimension breakdown</div>
              <div className="ev-dims-grid">
                {DIMENSIONS.map(dim => {
                  const s = result.scores?.[dim] ?? 0;
                  const pct = Math.round((s / 5) * 100);
                  const col = scoreColor(s);
                  return (
                    <div key={dim} className="ev-dim">
                      <div className="ev-dim-name">{dim}</div>
                      <div className="ev-dim-track">
                        <div className="ev-dim-fill" style={{ width: pct + '%', background: col }} />
                      </div>
                      <div className="ev-dim-score" style={{ color: col }}>{Number(s).toFixed(1)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {result.why && (
              <div className="ev-summary-card">
                <div className="ev-summary-label">Why this fits</div>
                <div className="ev-summary-body">{result.why}</div>
              </div>
            )}

            {result.watchout && (
              <div className="ev-summary-card ev-warn-card">
                <div className="ev-summary-label" style={{ color: '#d4a017' }}>Watch outs</div>
                <div className="ev-summary-body">{result.watchout}</div>
              </div>
            )}

            {error && <div className="ev-error">{error}</div>}

            <div className="ev-actions">
              <button className="ev-btn ev-btn-ghost" onClick={reset}>← Evaluate another</button>
              <button
                className="ev-btn ev-btn-primary"
                onClick={addToPipeline}
                disabled={adding || added}
              >
                {added ? '✓ Added to pipeline' : adding ? 'Adding...' : '+ Add to pipeline'}
              </button>
            </div>

            {added && (
              <div className="ev-success-bar">
                Added to pipeline →{' '}
                <span className="ev-success-link" onClick={() => navigate('/dashboard')}>View in dashboard</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
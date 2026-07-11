import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  canvas:         '#010102',
  s1:             '#0f1011',
  s2:             '#141516',
  s3:             '#18191a',
  hairline:       '#23252a',
  hairlineStrong: '#34343a',
  ink:            '#f7f8f8',
  inkMuted:       '#d0d6e0',
  inkSubtle:      '#8a8f98',
  inkTertiary:    '#62666d',
  accent:         '#5e6ad2',
  accentHover:    '#828fff',
  success:        '#27a644',
};

// ─── Kanban data for hero mockup ──────────────────────────────────────────────
const MOCK_COLS = [
  { label: 'Applied',   dot: T.accent,   cards: [{ co: 'Razorpay', role: 'SDE-1 · Backend' }, { co: 'Zepto', role: 'Full Stack' }] },
  { label: 'Interview', dot: '#d4a017',  cards: [{ co: 'Groww', role: 'Frontend Eng' }] },
  { label: 'Offer',     dot: T.success,  cards: [{ co: 'Setu', role: 'Backend · 7 LPA' }] },
  { label: 'Rejected',  dot: '#c94a4a',  cards: [{ co: 'Meesho', role: 'SDE-1' }] },
];

const FEATURES = [
  { icon: '⬡', title: 'Kanban pipeline', desc: 'Applied → Interview → Offer → Rejected. Click any card to update status, notes, or URL.' },
  { icon: '⚡', title: 'Auto-fill from URL', desc: 'Paste any job link. AI extracts company, role, skills, and salary in seconds.' },
  { icon: '✦', title: 'Resume match score', desc: 'Score your resume against any JD. Surface skill gaps. Know what to highlight before interviews.' },
  { icon: '◈', title: 'Smart suggestions', desc: '"Follow up now", "Prep for this one" — AI tells you exactly what to do today.' },
  { icon: '⊕', title: 'Evaluate page', desc: 'Paste a JD and get a 10-dimension breakdown: stack fit, seniority, growth, compensation, and more.' },
  { icon: '◎', title: 'Secure auth', desc: 'JWT + bcrypt. Your data is yours, token persists across sessions.' },
];

const TECH = [
  'React', 'Node.js', 'MongoDB Atlas', 'Express',
  'Claude API', 'Gemini API', 'JWT + bcrypt', 'Vercel · Render',
];

const STEPS = [
  { n: '01', title: 'Register',          desc: 'Create an account. JWT issued instantly.' },
  { n: '02', title: 'Add applications',  desc: 'Paste a URL for auto-fill, or add manually.' },
  { n: '03', title: 'Evaluate & score',  desc: 'Score your resume vs JD. See the 10-dimension breakdown.' },
  { n: '04', title: 'Act on insights',   desc: 'Follow-up prompts, prep reminders — what to do today.' },
];

// ─── Shared nav ───────────────────────────────────────────────────────────────
function Logo() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect width="20" height="20" rx="5" fill={T.accent}/>
      <path d="M5 14 L10 6 L15 14" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liveStats, setLiveStats] = useState(null);

  useEffect(() => {
    if (user) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/applications`)
        .then(res => {
          const apps = res.data;
          setLiveStats({
            total:     apps.length,
            applied:   apps.filter(a => a.status === 'Applied').length,
            interview: apps.filter(a => a.status === 'Interview').length,
            offer:     apps.filter(a => a.status === 'Offer').length,
          });
        })
        .catch(() => {});
    }
  }, [user]);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: T.canvas, color: T.ink, overflowX: 'hidden', margin: 0, padding: 0 }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        .lnd-navlink:hover { color: ${T.inkMuted} !important; }
        .lnd-feat:hover { border-color: ${T.hairlineStrong} !important; background: ${T.s2} !important; }
        .lnd-btn-p:hover  { background: ${T.accentHover} !important; }
        .lnd-btn-s:hover  { border-color: ${T.hairlineStrong} !important; color: ${T.ink} !important; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: T.s1 + 'f0',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${T.hairline}`,
        height: 52, display: 'flex', alignItems: 'center',
        padding: '0 32px', gap: 0,
      }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginRight: 36 }}>
          <Logo />
          <span style={{ fontSize: 14, fontWeight: 600, color: T.ink, letterSpacing: '-0.3px' }}>Runway</span>
        </div>

        <div style={{ display: 'flex', gap: 2, flex: 1 }}>
          {['Features', 'How it works', 'Tech stack'].map(l => (
            <button key={l} className="lnd-navlink"
              style={{ fontSize: 13, color: T.inkSubtle, background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: 6, transition: 'color 0.12s' }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <button className="lnd-btn-p"
              onClick={() => navigate('/dashboard')}
              style={{ fontSize: 13, fontWeight: 500, color: '#fff', background: T.accent, border: 'none', cursor: 'pointer', padding: '7px 14px', borderRadius: 7, transition: 'background 0.12s' }}>
              Go to Pipeline →
            </button>
          ) : (
            <>
              <button className="lnd-btn-s"
                onClick={() => navigate('/login')}
                style={{ fontSize: 13, color: T.inkSubtle, background: 'transparent', border: `1px solid ${T.hairline}`, cursor: 'pointer', padding: '7px 14px', borderRadius: 7, transition: 'border-color 0.12s, color 0.12s' }}>
                Log in
              </button>
              <button className="lnd-btn-p"
                onClick={() => navigate('/register')}
                style={{ fontSize: 13, fontWeight: 500, color: '#fff', background: T.accent, border: 'none', cursor: 'pointer', padding: '7px 14px', borderRadius: 7, transition: 'background 0.12s' }}>
                Get started →
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: '96px 32px 0', textAlign: 'center', position: 'relative' }}>
        {/* Subtle grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(${T.hairline} 1px, transparent 1px), linear-gradient(90deg, ${T.hairline} 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
          opacity: 0.4,
        }} />

        <div style={{ position: 'relative' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: T.s1, border: `1px solid ${T.hairline}`, borderRadius: 9999, padding: '5px 14px', fontSize: 11, fontWeight: 500, color: T.inkSubtle, letterSpacing: '0.3px', marginBottom: 32 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.success, display: 'inline-block' }} />
            AI-Powered Job Tracker · Full-Stack Project
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(38px, 6vw, 72px)', fontWeight: 600, lineHeight: 1.05, letterSpacing: 'clamp(-1.5px, -0.04em, -3px)', marginBottom: 24, maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
            Track every job.<br />
            <span style={{ color: T.accent }}>Land the one</span> that matters.
          </h1>

          {/* Sub */}
          <p style={{ fontSize: 17, color: T.inkSubtle, lineHeight: 1.65, maxWidth: 480, margin: '0 auto 44px' }}>
            Kanban pipeline with AI resume matching, 10-dimension job scoring, and auto-fill from any job URL.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 72 }}>
            <button className="lnd-btn-p"
              onClick={() => navigate('/register')}
              style={{ fontSize: 14, fontWeight: 500, color: '#fff', background: T.accent, border: 'none', cursor: 'pointer', padding: '10px 22px', borderRadius: 8, transition: 'background 0.12s' }}>
              Get started free →
            </button>
            <button className="lnd-btn-s"
              onClick={() => navigate('/login')}
              style={{ fontSize: 14, fontWeight: 500, color: T.inkSubtle, background: 'transparent', border: `1px solid ${T.hairline}`, cursor: 'pointer', padding: '10px 22px', borderRadius: 8, transition: 'border-color 0.12s, color 0.12s' }}>
              Log in
            </button>
          </div>

          {/* ── App mockup ── */}
          <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 16px' }}>
            <div style={{ background: T.s1, border: `1px solid ${T.hairline}`, borderRadius: '14px 14px 0 0', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
              {/* Browser chrome */}
              <div style={{ background: T.s2, borderBottom: `1px solid ${T.hairline}`, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {['#ff5f57', '#febc2e', '#28c840'].map(c => (
                    <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <div style={{ flex: 1, background: T.s3, borderRadius: 5, padding: '3px 10px', fontSize: 11, color: T.inkTertiary, maxWidth: 280, margin: '0 auto', textAlign: 'center', border: `1px solid ${T.hairline}` }}>
                  runway.vercel.app/dashboard
                </div>
              </div>

              {/* Kanban preview */}
              <div style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, background: T.canvas }}>
                {MOCK_COLS.map(col => {
                  const count = liveStats
                    ? (liveStats[col.label.toLowerCase()] ?? col.cards.length)
                    : col.cards.length;
                  return (
                    <div key={col.label} style={{ background: T.s1, border: `1px solid ${T.hairline}`, borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ padding: '9px 11px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.hairline}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: col.dot }} />
                          <span style={{ fontSize: 11, fontWeight: 500, color: T.inkSubtle }}>{col.label}</span>
                        </div>
                        <span style={{ fontSize: 10, color: T.inkTertiary }}>{count}</span>
                      </div>
                      <div style={{ padding: 7, display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {col.cards.map(c => (
                          <div key={c.co} style={{ background: T.s2, border: `1px solid ${T.hairline}`, borderRadius: 7, padding: '8px 9px' }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: T.ink }}>{c.co}</div>
                            <div style={{ fontSize: 9, color: T.inkTertiary, marginTop: 2 }}>{c.role}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TECH STRIP ── */}
      <div style={{ borderTop: `1px solid ${T.hairline}`, borderBottom: `1px solid ${T.hairline}`, padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', marginTop: 0 }}>
        <span style={{ fontSize: 11, color: T.inkTertiary, fontWeight: 500, whiteSpace: 'nowrap', marginRight: 28 }}>Built with</span>
        <div style={{ display: 'flex', gap: 0, flexWrap: 'nowrap' }}>
          {TECH.map(t => (
            <span key={t} style={{ fontSize: 13, fontWeight: 500, color: T.inkTertiary, whiteSpace: 'nowrap', marginRight: 32 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section style={{ padding: '96px 32px' }}>
        <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 56px' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: T.accent, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>Features</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.8px', color: T.ink, marginBottom: 14 }}>
            Everything to land your next role
          </h2>
          <p style={{ fontSize: 15, color: T.inkSubtle, lineHeight: 1.6 }}>
            Built for CS grads targeting product startups. From tracking to AI scoring in one tool.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, maxWidth: 1100, margin: '0 auto' }}>
          {FEATURES.map(f => (
            <div key={f.title} className="lnd-feat"
              style={{ background: T.s1, border: `1px solid ${T.hairline}`, borderRadius: 12, padding: '24px', transition: 'background 0.12s, border-color 0.12s', cursor: 'default' }}>
              <div style={{ fontSize: 18, marginBottom: 16, color: T.accent }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, marginBottom: 8, letterSpacing: '-0.2px' }}>{f.title}</div>
              <div style={{ fontSize: 13, color: T.inkSubtle, lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '0 32px 96px' }}>
        <div style={{ background: T.s1, border: `1px solid ${T.hairline}`, borderRadius: 16, padding: '48px 56px', maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40 }}>
          {[
            { n: liveStats ? liveStats.total : '9', label: liveStats ? 'Applications in your pipeline' : 'API endpoints — production-ready' },
            { n: '3',          label: 'AI features — auto-fill, resume match, smart suggestions' },
            { n: '10',         label: 'Dimensions scored per job — stack fit, growth, compensation & more' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 600, color: T.ink, letterSpacing: '-2px', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 13, color: T.inkSubtle, marginTop: 10, lineHeight: 1.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '0 32px 96px', borderTop: `1px solid ${T.hairline}` }}>
        <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto', padding: '80px 0 56px' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: T.accent, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>How it works</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.8px', color: T.ink }}>
            Up and running in minutes
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, maxWidth: 1100, margin: '0 auto' }}>
          {STEPS.map(s => (
            <div key={s.n} style={{ padding: '24px 20px', borderLeft: `1px solid ${T.hairline}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.inkTertiary, letterSpacing: '1px', marginBottom: 14 }}>{s.n}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, marginBottom: 8, letterSpacing: '-0.2px' }}>{s.title}</div>
              <div style={{ fontSize: 13, color: T.inkSubtle, lineHeight: 1.65 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '0 32px 96px' }}>
        <div style={{ background: T.s1, border: `1px solid ${T.hairline}`, borderRadius: 16, padding: '64px 48px', maxWidth: 1100, margin: '0 auto', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Accent glow */}
          <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 400, height: 200, background: T.accent, opacity: 0.06, borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 600, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16, color: T.ink }}>
              Built to ship.<br />Designed to impress.
            </h2>
            <p style={{ fontSize: 15, color: T.inkSubtle, marginBottom: 36, lineHeight: 1.6, maxWidth: 480, margin: '0 auto 36px' }}>
              Full-stack AI app with auth, CRUD, and LLM features. The portfolio project that gets you the interview.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="lnd-btn-p"
                onClick={() => navigate('/register')}
                style={{ fontSize: 14, fontWeight: 500, color: '#fff', background: T.accent, border: 'none', cursor: 'pointer', padding: '10px 22px', borderRadius: 8, transition: 'background 0.12s' }}>
                Start tracking →
              </button>
              <button className="lnd-btn-s"
                onClick={() => navigate('/login')}
                style={{ fontSize: 14, fontWeight: 500, color: T.inkSubtle, background: 'transparent', border: `1px solid ${T.hairline}`, cursor: 'pointer', padding: '10px 22px', borderRadius: 8, transition: 'border-color 0.12s, color 0.12s' }}>
                Log in
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${T.hairline}`, padding: '48px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect width="20" height="20" rx="5" fill={T.accent}/>
                <path d="M5 14 L10 6 L15 14" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 600, color: T.ink, letterSpacing: '-0.3px' }}>Runway</span>
            </div>
            <p style={{ fontSize: 13, color: T.inkTertiary, lineHeight: 1.6, maxWidth: 220, margin: 0 }}>
              AI-powered job tracker built by Atharva Kadam, CS grad from Maharashtra targeting product startups.
            </p>
          </div>
          {[
            { title: 'Product', links: ['Pipeline', 'Evaluate', 'Resume Match', 'AI Suggestions'] },
            { title: 'Project', links: ['GitHub', 'README', 'API Docs', 'Postman Collection'] },
            { title: 'Connect', links: ['LinkedIn', 'Wellfound', 'Portfolio', 'Email'] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 11, fontWeight: 500, color: T.inkTertiary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>{col.title}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, padding: 0, margin: 0 }}>
                {col.links.map(l => (
                  <li key={l}><span style={{ fontSize: 13, color: T.inkSubtle, cursor: 'pointer' }}>{l}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${T.hairline}`, marginTop: 48, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1100, margin: '48px auto 0' }}>
          <span style={{ fontSize: 12, color: T.inkTertiary }}>© 2025 Atharva Kadam — CS Graduate, Maharashtra</span>
          <span style={{ fontSize: 12, color: T.inkTertiary }}>React · Node · MongoDB · Claude API</span>
        </div>
      </footer>
    </div>
  );
}
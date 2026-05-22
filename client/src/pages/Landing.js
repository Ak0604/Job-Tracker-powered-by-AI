import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const N_COLORS = {
  navy: '#0a1530',
  navyMid: '#1a2a52',
  primary: '#5645d4',
  primaryDeep: '#3a2a99',
  canvas: '#ffffff',
  surface: '#f6f5f4',
  surfaceSoft: '#fafaf9',
  hairline: '#e5e3df',
  hairlineStrong: '#c8c4be',
  ink: '#1a1a1a',
  charcoal: '#37352f',
  slate: '#5d5b54',
  steel: '#787671',
  stone: '#a4a097',
  onDark: '#ffffff',
  onDarkMuted: '#a4a097',
  peach: '#ffe8d4',
  rose: '#fde0ec',
  mint: '#d9f3e1',
  lavender: '#e6e0f5',
  sky: '#dcecfa',
  yellow: '#fef7d6',
  yellowBold: '#f9e79f',
  brandGreen: '#1aae39',
  brandOrange: '#dd5b00',
  brandYellow: '#f5d75e',
  brandPink: '#ff64c8',
  brandTeal: '#2a9d99',
};

const styles = {
  root: {
    fontFamily: "'Inter', system-ui, sans-serif",
    background: N_COLORS.canvas,
    color: N_COLORS.ink,
    overflowX: 'hidden',
    margin: 0,
    padding: 0,
  },
  // NAV
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(8px)',
    borderBottom: `1px solid ${N_COLORS.hairline}`,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    padding: '0 32px',
    gap: 0,
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 700,
    fontSize: 16,
    color: N_COLORS.ink,
    textDecoration: 'none',
    marginRight: 32,
    cursor: 'pointer',
  },
  navLogoIcon: {
    width: 28,
    height: 28,
    background: N_COLORS.ink,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 800,
    fontSize: 13,
  },
  navLinks: { display: 'flex', gap: 4, flex: 1 },
  navLink: {
    fontSize: 13,
    color: N_COLORS.slate,
    textDecoration: 'none',
    padding: '6px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
  },
  navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  btnGhost: {
    fontSize: 13,
    color: N_COLORS.ink,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: 8,
  },
  btnPrimary: {
    fontSize: 13,
    fontWeight: 500,
    color: '#fff',
    background: N_COLORS.primary,
    border: 'none',
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: 8,
  },
  // HERO
  hero: {
    background: N_COLORS.navy,
    color: N_COLORS.onDark,
    padding: '100px 32px 0',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 9999,
    padding: '5px 14px',
    fontSize: 12,
    fontWeight: 600,
    color: N_COLORS.onDark,
    marginBottom: 28,
    letterSpacing: '0.5px',
  },
  heroBadgeDot: { width: 6, height: 6, background: N_COLORS.brandGreen, borderRadius: '50%' },
  heroTitle: {
    fontSize: 'clamp(36px,6vw,72px)',
    fontWeight: 600,
    lineHeight: 1.05,
    letterSpacing: '-2px',
    marginBottom: 24,
    maxWidth: 760,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  heroTitleAccent: { color: N_COLORS.brandYellow },
  heroSub: {
    fontSize: 18,
    color: N_COLORS.onDarkMuted,
    lineHeight: 1.6,
    maxWidth: 520,
    margin: '0 auto 40px',
  },
  heroBtns: { display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 64 },
  btnHeroPrimary: {
    fontSize: 14,
    fontWeight: 500,
    color: '#fff',
    background: N_COLORS.primary,
    border: 'none',
    cursor: 'pointer',
    padding: '12px 24px',
    borderRadius: 8,
  },
  btnHeroSecondary: {
    fontSize: 14,
    fontWeight: 500,
    color: N_COLORS.onDark,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.3)',
    cursor: 'pointer',
    padding: '12px 24px',
    borderRadius: 8,
  },
  // MOCKUP
  mockupWrap: { maxWidth: 900, margin: '0 auto', padding: '0 16px' },
  mockupCard: {
    background: N_COLORS.canvas,
    borderRadius: '12px 12px 0 0',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: 'rgba(15,15,15,0.35) 0px 24px 64px -8px',
    overflow: 'hidden',
  },
  mockupBar: {
    background: '#f0eeec',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderBottom: `1px solid ${N_COLORS.hairline}`,
  },
  mockupDot: { width: 10, height: 10, borderRadius: '50%' },
  mockupUrl: {
    flex: 1,
    background: N_COLORS.canvas,
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 11,
    color: N_COLORS.stone,
    border: `1px solid ${N_COLORS.hairline}`,
    maxWidth: 300,
    margin: '0 auto',
    textAlign: 'center',
  },
  mockupBody: {
    padding: 16,
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: 10,
    minHeight: 220,
    background: N_COLORS.surfaceSoft,
  },
  kCol: {
    background: N_COLORS.canvas,
    borderRadius: 12,
    border: `1px solid ${N_COLORS.hairline}`,
    overflow: 'hidden',
  },
  kColHead: {
    padding: '10px 12px',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: N_COLORS.charcoal,
  },
  kBadge: { fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 9999 },
  kCards: { padding: 6, display: 'flex', flexDirection: 'column', gap: 6 },
  kCard: {
    background: N_COLORS.canvas,
    border: `1px solid ${N_COLORS.hairline}`,
    borderRadius: 8,
    padding: '9px 10px',
  },
  kCardCompany: { fontSize: 12, fontWeight: 600, color: N_COLORS.ink, marginBottom: 2 },
  kCardRole: { fontSize: 10, color: N_COLORS.slate },
  kCardDays: { fontSize: 9, color: N_COLORS.stone, marginTop: 5 },
  // LOGO WALL
  logoWall: {
    borderTop: `1px solid ${N_COLORS.hairline}`,
    borderBottom: `1px solid ${N_COLORS.hairline}`,
    padding: '18px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    overflow: 'hidden',
  },
  logoWallLabel: { fontSize: 12, color: N_COLORS.stone, fontWeight: 500, whiteSpace: 'nowrap', marginRight: 32 },
  logoItem: { fontSize: 14, fontWeight: 600, color: N_COLORS.steel, whiteSpace: 'nowrap', marginRight: 40 },
  // SECTION
  section: { padding: '80px 32px' },
  sectionCenter: { textAlign: 'center', maxWidth: 640, margin: '0 auto 56px' },
  sectionEyebrow: { fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: N_COLORS.primary, marginBottom: 12 },
  sectionTitle: { fontSize: 'clamp(28px,4vw,44px)', fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.5px', color: N_COLORS.ink, marginBottom: 16 },
  sectionSub: { fontSize: 16, color: N_COLORS.slate, lineHeight: 1.6 },
  // FEATURES
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, maxWidth: 1100, margin: '0 auto' },
  featCard: { borderRadius: 12, padding: 32, position: 'relative', overflow: 'hidden' },
  featIcon: { width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 20 },
  featTitle: { fontSize: 18, fontWeight: 600, color: N_COLORS.charcoal, marginBottom: 8 },
  featDesc: { fontSize: 14, color: N_COLORS.slate, lineHeight: 1.6 },
  // STATS
  statsStrip: {
    background: N_COLORS.surface,
    borderRadius: 16,
    padding: 56,
    maxWidth: 1100,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: 40,
  },
  statItem: { textAlign: 'center' },
  statNum: { fontSize: 48, fontWeight: 600, color: N_COLORS.ink, letterSpacing: '-1px', lineHeight: 1 },
  statLabel: { fontSize: 14, color: N_COLORS.slate, marginTop: 8, lineHeight: 1.5 },
  // STEPS
  steps: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, maxWidth: 1100, margin: '0 auto' },
  step: { textAlign: 'center', padding: '24px 16px' },
  stepNum: {
    width: 44, height: 44, borderRadius: '50%', background: N_COLORS.primary,
    color: '#fff', fontSize: 16, fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
  },
  stepTitle: { fontSize: 15, fontWeight: 600, color: N_COLORS.ink, marginBottom: 8 },
  stepDesc: { fontSize: 13, color: N_COLORS.slate, lineHeight: 1.6 },
  // TECH
  techRow: { display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 700, margin: '0 auto' },
  techBadge: {
    display: 'flex', alignItems: 'center', gap: 7,
    background: N_COLORS.canvas, border: `1px solid ${N_COLORS.hairline}`,
    borderRadius: 9999, padding: '8px 16px', fontSize: 13, fontWeight: 500, color: N_COLORS.charcoal,
  },
  techDot: { width: 8, height: 8, borderRadius: '50%' },
  // CTA
  ctaSection: { background: N_COLORS.navy, color: N_COLORS.onDark, padding: '80px 32px', textAlign: 'center' },
  ctaTitle: { fontSize: 'clamp(32px,5vw,52px)', fontWeight: 600, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 20 },
  ctaSub: { fontSize: 16, color: N_COLORS.onDarkMuted, marginBottom: 40 },
  // FOOTER
  footer: {
    background: N_COLORS.canvas, borderTop: `1px solid ${N_COLORS.hairline}`,
    padding: '40px 32px 0', display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 32,
  },
  footerBrand: { fontSize: 15, fontWeight: 700, color: N_COLORS.ink, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 },
  footerBrandIcon: { width: 24, height: 24, background: N_COLORS.ink, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12 },
  footerTagline: { fontSize: 13, color: N_COLORS.slate, lineHeight: 1.6, maxWidth: 240 },
  footerColTitle: { fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', color: N_COLORS.stone, textTransform: 'uppercase', marginBottom: 12 },
  footerLinks: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, padding: 0, margin: 0 },
  footerLink: { fontSize: 13, color: N_COLORS.slate, textDecoration: 'none', cursor: 'pointer' },
  footerBottom: {
    borderTop: `1px solid ${N_COLORS.hairline}`,
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerCopy: { fontSize: 12, color: N_COLORS.stone },
};

const KANBAN_COLUMNS = [
  { label: 'Applied', badgeBg: '#dcecfa', badgeColor: '#185fa5', companies: [{ name: 'Razorpay', role: 'SDE-1 · Backend', days: '3 days ago' }, { name: 'Zepto', role: 'Full Stack Eng', days: '1 day ago' }] },
  { label: 'Interview', badgeBg: '#fef7d6', badgeColor: '#793400', companies: [{ name: 'Groww', role: 'Frontend Eng', days: '5 days ago' }] },
  { label: 'Offer', badgeBg: '#d9f3e1', badgeColor: '#0f6e56', companies: [{ name: 'Setu', role: 'Backend · 7 LPA', days: 'Offer received!' }] },
  { label: 'Rejected', badgeBg: '#f0eeec', badgeColor: '#787671', companies: [{ name: 'Meesho', role: 'SDE-1', days: '8 days ago' }] },
];

const FEATURES = [
  { bg: N_COLORS.lavender, iconBg: '#d6b6f6', icon: '📋', title: 'Kanban Board', desc: 'Visual pipeline: Applied → Interview → Offer → Rejected. Click any card to edit status, notes, or URL.' },
  { bg: N_COLORS.mint, iconBg: '#9FE1CB', icon: '🔒', title: 'Secure JWT Auth', desc: 'bcrypt-hashed passwords. Token persists across sessions — no repeated logins.' },
  { bg: N_COLORS.peach, iconBg: '#f5c4a0', icon: '⚡', title: 'Auto-fill from URL', desc: 'Paste any job link. Claude extracts company, role, skills, and salary automatically.' },
  { bg: N_COLORS.sky, iconBg: '#b5d4f4', icon: '📊', title: 'Stats Dashboard', desc: 'Live counts per stage. Track application velocity toward your target.' },
  { bg: N_COLORS.rose, iconBg: '#f4c0d1', icon: '🤖', title: 'Resume Match Score', desc: 'Claude scores your resume vs JD, surfaces skill gaps, and tells you what to highlight.' },
  { bg: N_COLORS.yellow, iconBg: '#fac775', icon: '💡', title: 'Smart Suggestions', desc: '"Follow up now", "Prep for interview" — AI tells you exactly what to do today.' },
];

const TECH = [
  { label: 'React', color: '#61dafb' },
  { label: 'Node.js', color: '#68a063' },
  { label: 'MongoDB Atlas', color: '#47a248' },
  { label: 'Express', color: '#000' },
  { label: 'Claude API', color: '#5645d4' },
  { label: 'JWT + bcryptjs', color: '#e34c26' },
  { label: 'Vercel', color: '#000' },
  { label: 'Render', color: '#46e3b7' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ applied: 0, interview: 0, offer: 0, rejected: 0 });

  useEffect(() => {
    // If already logged in, fetch real stats for hero
    if (user) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/applications`)
        .then(res => {
          const apps = res.data;
          setStats({
            applied: apps.filter(a => a.status === 'Applied').length,
            interview: apps.filter(a => a.status === 'Interview').length,
            offer: apps.filter(a => a.status === 'Offer').length,
            rejected: apps.filter(a => a.status === 'Rejected').length,
          });
        })
        .catch(() => {});
    }
  }, [user]);

  const totalApps = stats.applied + stats.interview + stats.offer + stats.rejected;

  return (
    <div style={styles.root}>
      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.navLogo} onClick={() => navigate('/')}>
          <div style={styles.navLogoIcon}>JT</div>
          JobTracker
        </div>
        <div style={styles.navLinks}>
          {['Features', 'AI Tools', 'How it works', 'Tech Stack'].map(l => (
            <button key={l} style={styles.navLink}>{l}</button>
          ))}
        </div>
        <div style={styles.navRight}>
          {user ? (
            <button style={styles.btnPrimary} onClick={() => navigate('/dashboard')}>Go to Dashboard →</button>
          ) : (
            <>
              <button style={styles.btnGhost} onClick={() => navigate('/login')}>Log in</button>
              <button style={styles.btnPrimary} onClick={() => navigate('/register')}>Get started free</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={styles.hero}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
          <circle cx="80" cy="80" r="10" fill="#f5d75e" opacity="0.85" />
          <circle cx="160" cy="200" r="7" fill="#ff64c8" opacity="0.7" />
          <circle cx="50" cy="320" r="12" fill="#2a9d99" opacity="0.65" />
          <circle cx="200" cy="440" r="8" fill="#5645d4" opacity="0.7" />
          <circle cx="1100" cy="90" r="9" fill="#ff64c8" opacity="0.75" />
          <circle cx="1160" cy="240" r="11" fill="#f5d75e" opacity="0.8" />
          <circle cx="1080" cy="380" r="7" fill="#1aae39" opacity="0.65" />
          <circle cx="1140" cy="490" r="13" fill="#5645d4" opacity="0.5" />
          <line x1="80" y1="80" x2="160" y2="200" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="160" y1="200" x2="50" y2="320" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="1100" y1="90" x2="1160" y2="240" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="1160" y1="240" x2="1080" y2="380" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        </svg>

        <div style={{ position: 'relative' }}>
          <div style={styles.heroBadge}>
            <span style={styles.heroBadgeDot} />
            AI-Powered · Full-Stack Project
          </div>
          <h1 style={styles.heroTitle}>
            Track every job.<br />
            <span style={styles.heroTitleAccent}>Land the one</span> that matters.
          </h1>
          <p style={styles.heroSub}>
            A Kanban-style tracker with AI resume matching, smart follow-up suggestions, and auto-fill from any job URL.
          </p>
          <div style={styles.heroBtns}>
            <button style={styles.btnHeroPrimary} onClick={() => navigate('/register')}>
              Get started free →
            </button>
            <button style={styles.btnHeroSecondary} onClick={() => navigate('/login')}>
              Log in
            </button>
          </div>

          {/* App Mockup */}
          <div style={styles.mockupWrap}>
            <div style={styles.mockupCard}>
              <div style={styles.mockupBar}>
                <div style={{ ...styles.mockupDot, background: '#ff5f57' }} />
                <div style={{ ...styles.mockupDot, background: '#febc2e' }} />
                <div style={{ ...styles.mockupDot, background: '#28c840' }} />
                <div style={styles.mockupUrl}>jobtracker.vercel.app/dashboard</div>
              </div>
              <div style={styles.mockupBody}>
                {KANBAN_COLUMNS.map(col => (
                  <div key={col.label} style={styles.kCol}>
                    <div style={styles.kColHead}>
                      {col.label}
                      <span style={{ ...styles.kBadge, background: col.badgeBg, color: col.badgeColor }}>
                        {user ? stats[col.label.toLowerCase()] : col.companies.length}
                      </span>
                    </div>
                    <div style={styles.kCards}>
                      {col.companies.map(c => (
                        <div key={c.name} style={styles.kCard}>
                          <div style={styles.kCardCompany}>{c.name}</div>
                          <div style={styles.kCardRole}>{c.role}</div>
                          <div style={styles.kCardDays}>{c.days}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGO WALL */}
      <div style={styles.logoWall}>
        <span style={styles.logoWallLabel}>Built with</span>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {['React', 'Node.js', 'MongoDB', 'Express', 'JWT Auth', 'Claude API', 'Vercel', 'Render'].map(t => (
            <span key={t} style={styles.logoItem}>{t}</span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section style={{ ...styles.section, background: N_COLORS.surfaceSoft }}>
        <div style={styles.sectionCenter}>
          <div style={styles.sectionEyebrow}>Features</div>
          <h2 style={styles.sectionTitle}>Everything you need to land your next role</h2>
          <p style={styles.sectionSub}>From tracking applications to AI-powered insights — built for Indian CS grads targeting product startups.</p>
        </div>
        <div style={styles.featureGrid}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ ...styles.featCard, background: f.bg }}>
              <div style={{ ...styles.featIcon, background: f.iconBg }}>{f.icon}</div>
              <div style={styles.featTitle}>{f.title}</div>
              <div style={styles.featDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section style={styles.section}>
        <div style={styles.statsStrip}>
          <div style={styles.statItem}>
            <div style={styles.statNum}>{user && totalApps > 0 ? totalApps : 9}</div>
            <div style={styles.statLabel}>
              {user && totalApps > 0 ? 'Your active applications' : 'API endpoints — fully tested and production-ready'}
            </div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNum}>3</div>
            <div style={styles.statLabel}>AI features powered by Claude — auto-fill, match scoring, smart suggestions</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNum}>5–8<span style={{ fontSize: 28 }}>LPA</span></div>
            <div style={styles.statLabel}>Target salary range — built for product startups on Wellfound</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ ...styles.section, background: N_COLORS.surfaceSoft }}>
        <div style={styles.sectionCenter}>
          <div style={styles.sectionEyebrow}>How it works</div>
          <h2 style={styles.sectionTitle}>Up and running in minutes</h2>
        </div>
        <div style={styles.steps}>
          {[
            { n: '1', title: 'Register', desc: 'Create an account. JWT issued instantly — your data is yours, secured with bcrypt.' },
            { n: '2', title: 'Add applications', desc: 'Paste a job URL and let AI auto-fill, or add manually. It lands in your Applied column.' },
            { n: '3', title: 'Get AI insights', desc: 'Score your resume against the JD. See skill gaps. Know what to say in interviews.' },
            { n: '4', title: 'Act on suggestions', desc: 'Claude tells you who to follow up with, who to prep for, and what to do today.' },
          ].map(s => (
            <div key={s.n} style={styles.step}>
              <div style={styles.stepNum}>{s.n}</div>
              <div style={styles.stepTitle}>{s.title}</div>
              <div style={styles.stepDesc}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TECH STACK */}
      <section style={{ ...styles.section, textAlign: 'center' }}>
        <div style={styles.sectionCenter}>
          <div style={styles.sectionEyebrow}>Tech Stack</div>
          <h2 style={styles.sectionTitle}>Production-grade, portfolio-ready</h2>
          <p style={styles.sectionSub}>Modern MERN stack with AI, deployed on free tiers — your first shipped product.</p>
        </div>
        <div style={styles.techRow}>
          {TECH.map(t => (
            <div key={t.label} style={styles.techBadge}>
              <div style={{ ...styles.techDot, background: t.color }} />
              {t.label}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <svg style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none' }} viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
          <circle cx="100" cy="80" r="8" fill="#f5d75e" opacity="0.5" />
          <circle cx="1100" cy="320" r="10" fill="#ff64c8" opacity="0.45" />
        </svg>
        <div style={{ position: 'relative' }}>
          <h2 style={styles.ctaTitle}>Built to impress.<br />Deployed to ship.</h2>
          <p style={styles.ctaSub}>Full-stack AI app with auth, CRUD, and LLM features. The portfolio project that gets you the interview.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button style={styles.btnHeroPrimary} onClick={() => navigate('/register')}>Start tracking →</button>
            <button style={styles.btnHeroSecondary} onClick={() => navigate('/login')}>Log in</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div>
          <div style={styles.footerBrand}>
            <div style={styles.footerBrandIcon}>JT</div>
            JobTracker
          </div>
          <p style={styles.footerTagline}>An AI-powered job application tracker built by a CS grad from Maharashtra targeting 5–8 LPA at Indian product startups.</p>
        </div>
        {[
          { title: 'Product', links: ['Dashboard', 'AI Features', 'Kanban Board', 'Resume Match'] },
          { title: 'Project', links: ['GitHub Repo', 'README', 'API Docs', 'Postman Collection'] },
          { title: 'Connect', links: ['LinkedIn', 'Wellfound', 'Portfolio', 'Email'] },
        ].map(col => (
          <div key={col.title}>
            <div style={styles.footerColTitle}>{col.title}</div>
            <ul style={styles.footerLinks}>
              {col.links.map(l => <li key={l}><span style={styles.footerLink}>{l}</span></li>)}
            </ul>
          </div>
        ))}
      </footer>
      <div style={styles.footerBottom}>
        <span style={styles.footerCopy}>© 2025 Atharva Kulkarni — CS Graduate, Maharashtra</span>
        <span style={styles.footerCopy}>React · Node · MongoDB · Claude API</span>
      </div>
    </div>
  );
}
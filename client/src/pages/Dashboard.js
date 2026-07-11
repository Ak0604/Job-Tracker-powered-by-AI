import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// ─── Design tokens (Linear system) ──────────────────────────────────────────
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
  warn:           '#d4a017',
  danger:         '#c94a4a',
};

// ─── Column config ────────────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'Applied',   label: 'Applied',   dot: '#5e6ad2' },
  { key: 'Interview', label: 'Interview',  dot: '#d4a017' },
  { key: 'Offer',     label: 'Offer',      dot: '#27a644' },
  { key: 'Rejected',  label: 'Rejected',   dot: '#c94a4a' },
];

const STATUS_OPTIONS = ['Applied', 'Interview', 'Offer', 'Rejected'];

// ─── Score badge ──────────────────────────────────────────────────────────────
function scoreBadgeStyle(score) {
  if (score === undefined || score === null) return null;
  const n = parseFloat(score);
  const color = n >= 4.0 ? T.success : n >= 3.0 ? T.accent : n >= 2.0 ? T.warn : T.danger;
  return { color, background: color + '26', border: `1px solid ${color}40` };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return '1d ago';
  return `${diff}d ago`;
}

function initials(company = '') {
  return company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const EMPTY_FORM = { company: '', role: '', status: 'Applied', jobUrl: '', notes: '' };

// ─── Shared nav ──────────────────────────────────────────────────────────────
function Nav({ user, logout, navigate, hasStoredResume }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: T.s1,
      borderBottom: `1px solid ${T.hairline}`,
      height: 52, display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 0,
    }}>
      <div
        onClick={() => navigate('/')}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginRight: 32 }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect width="20" height="20" rx="5" fill={T.accent}/>
          <path d="M5 14 L10 6 L15 14" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
        </svg>
        <span style={{ fontSize: 14, fontWeight: 600, color: T.ink, letterSpacing: '-0.3px' }}>Runway</span>
      </div>

      <div style={{ display: 'flex', gap: 2, flex: 1 }}>
        {[
          { label: 'Pipeline', path: '/dashboard' },
          { label: 'Evaluate', path: '/evaluate' },
        ].map(({ label, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            style={{
              fontSize: 13, fontWeight: 500,
              color: window.location.pathname === path ? T.ink : T.inkSubtle,
              background: window.location.pathname === path ? T.s2 : 'transparent',
              border: 'none', cursor: 'pointer',
              padding: '5px 10px', borderRadius: 6,
            }}
          >{label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: T.inkSubtle }}>
          {user?.name?.split(' ')[0]}
        </span>
        <button
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 500, color: T.inkMuted,
            background: T.s2, border: `1px solid ${T.hairline}`,
            cursor: 'pointer', padding: '5px 10px', borderRadius: 6,
          }}
        >
          <span style={{
            width: 18, height: 18, borderRadius: '50%',
            background: T.accent, display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 10, fontWeight: 700,
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </span>
          Profile
          {hasStoredResume === true && (
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.success }} />
          )}
        </button>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          style={{
            fontSize: 12, color: T.inkTertiary,
            background: 'transparent', border: `1px solid ${T.hairline}`,
            cursor: 'pointer', padding: '5px 10px', borderRadius: 6,
          }}
        >Log out</button>
      </div>
    </nav>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [apps, setApps]                   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showAdd, setShowAdd]             = useState(false);
  const [editApp, setEditApp]             = useState(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [saving, setSaving]               = useState(false);
  const [aiPanel, setAiPanel]             = useState(null);
  const [aiInput, setAiInput]             = useState({ jd: '' });
  const [aiResult, setAiResult]           = useState('');
  const [aiLoading, setAiLoading]         = useState(false);
  const [autofillUrl, setAutofillUrl]     = useState('');
  const [autofilling, setAutofilling]     = useState(false);
  const [suggestions, setSuggestions]     = useState([]);
  const [hasStoredResume, setHasStoredResume] = useState(null);
  const [resumeSource, setResumeSource]   = useState('');

  const fetchApps = useCallback(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/applications`)
      .then(res => { setApps(res.data); setLoading(false); })
      .catch(err => {
        if (err.response?.status === 401) { logout(); navigate('/login'); }
        setLoading(false);
      });
  }, [logout, navigate]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/user/resume`)
      .then(res => setHasStoredResume(res.data.hasResume))
      .catch(() => setHasStoredResume(false));
  }, []);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchApps();
  }, [user, fetchApps, navigate]);

  const handleSave = async () => {
    if (!form.company || !form.role) return;
    setSaving(true);
    try {
      if (editApp) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/applications/${editApp._id}`, form);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/applications`, form);
      }
      fetchApps(); setShowAdd(false); setEditApp(null); setForm(EMPTY_FORM);
    } catch (e) {
      if (e.response?.status === 401) { logout(); navigate('/login'); }
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    await axios.delete(`${process.env.REACT_APP_API_URL}/api/applications/${id}`);
    fetchApps(); setEditApp(null);
  };

  const openEdit = (app) => {
    setEditApp(app);
    setForm({ company: app.company, role: app.role, status: app.status, jobUrl: app.jobUrl || '', notes: app.notes || '' });
    setShowAdd(true);
  };

  const openAdd = () => { setEditApp(null); setForm(EMPTY_FORM); setShowAdd(true); };

  const handleAutofill = async () => {
    if (!autofillUrl) return;
    setAutofilling(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/autofill`, { url: autofillUrl });
      setForm(prev => ({ ...prev, ...res.data }));
      setAutofillUrl(''); setShowAdd(true);
    } catch { alert('Auto-fill failed. Try adding manually.'); }
    setAutofilling(false);
  };

  const handleMatchScore = async () => {
    if (!aiInput.jd) return;
    setAiLoading(true); setAiResult(''); setResumeSource('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/match`, { jd: aiInput.jd });
      setAiResult(res.data.result);
      setResumeSource(res.data.resumeSource || '');
    } catch (err) {
      const code = err.response?.data?.code;
      setAiResult(code === 'NO_RESUME'
        ? '⚠️ No resume on file. Upload one in Profile first.'
        : err.response?.data?.error || 'Error getting match score.');
    }
    setAiLoading(false);
  };

  const handleSuggest = async () => {
    setAiLoading(true); setSuggestions([]);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/suggest`, { applications: apps });
      setSuggestions(res.data.suggestions || []);
    } catch { setSuggestions([{ text: 'Error fetching suggestions. Please try again.' }]); }
    setAiLoading(false);
  };

  const colApps = (key) => apps.filter(a => a.status === key);

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: T.canvas, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 28, height: 28, border: `2px solid ${T.hairline}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
          <div style={{ fontSize: 13, color: T.inkTertiary }}>Loading pipeline…</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: T.canvas, minHeight: '100vh', color: T.ink }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .rwy-card:hover   { background: ${T.s2} !important; border-color: ${T.hairlineStrong} !important; }
        .rwy-btn:hover    { opacity: 0.85; }
        input:focus, textarea:focus, select:focus { outline: 2px solid ${T.accent}80 !important; outline-offset: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.hairlineStrong}; border-radius: 3px; }
      `}</style>

      <Nav user={user} logout={logout} navigate={navigate} hasStoredResume={hasStoredResume} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px' }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: T.ink, letterSpacing: '-0.5px', margin: 0 }}>Pipeline</h1>
            <p style={{ fontSize: 13, color: T.inkTertiary, marginTop: 4 }}>
              {apps.length} application{apps.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { setAiPanel(aiPanel === 'match' ? null : 'match'); }}
              style={{ fontSize: 12, fontWeight: 500, color: T.accent, background: T.s1, border: `1px solid ${T.hairline}`, cursor: 'pointer', padding: '7px 12px', borderRadius: 6 }}
            >✦ Resume match</button>
            <button
              onClick={() => { setAiPanel(aiPanel === 'suggest' ? null : 'suggest'); if (aiPanel !== 'suggest') handleSuggest(); }}
              style={{ fontSize: 12, fontWeight: 500, color: T.inkMuted, background: T.s1, border: `1px solid ${T.hairline}`, cursor: 'pointer', padding: '7px 12px', borderRadius: 6 }}
            >💡 Suggestions</button>
            <button onClick={openAdd} className="rwy-btn"
              style={{ fontSize: 13, fontWeight: 500, color: '#fff', background: T.accent, border: 'none', cursor: 'pointer', padding: '7px 14px', borderRadius: 6 }}>
              + Add
            </button>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
          {COLUMNS.map(col => {
            const count = colApps(col.key).length;
            return (
              <div key={col.key} style={{ background: T.s1, border: `1px solid ${T.hairline}`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: T.inkTertiary, letterSpacing: '0.3px', marginBottom: 6 }}>{col.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 600, color: T.ink, lineHeight: 1 }}>{count}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot }} />
              </div>
            );
          })}
        </div>

        {/* ── Auto-fill bar ── */}
        <div style={{ background: T.s1, border: `1px solid ${T.hairline}`, borderRadius: 10, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: T.accent, whiteSpace: 'nowrap' }}>↗ Auto-fill</span>
          <input
            value={autofillUrl}
            onChange={e => setAutofillUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAutofill()}
            placeholder="Paste a job URL — Wellfound, LinkedIn, any board…"
            style={{ flex: 1, background: T.s2, border: `1px solid ${T.hairline}`, borderRadius: 6, padding: '7px 10px', fontSize: 13, color: T.ink, fontFamily: 'inherit' }}
          />
          <button onClick={handleAutofill} disabled={autofilling} className="rwy-btn"
            style={{ background: T.accent, color: '#fff', border: 'none', cursor: 'pointer', padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>
            {autofilling ? 'Filling…' : 'Fill →'}
          </button>
        </div>

        {/* ── AI panel: match ── */}
        {aiPanel === 'match' && (
          <div style={{ background: T.s1, border: `1px solid ${T.hairline}`, borderRadius: 10, padding: 20, marginBottom: 24, animation: 'fadeIn 0.18s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>✦ Resume Match</span>
              <button onClick={() => setAiPanel(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, color: T.inkTertiary, lineHeight: 1 }}>×</button>
            </div>

            {hasStoredResume === true ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: T.success + '18', border: `1px solid ${T.success}40`, color: T.success, fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 9999, marginBottom: 12 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.success, display: 'inline-block' }} />
                Using saved resume
              </div>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: T.warn + '18', border: `1px solid ${T.warn}40`, color: T.warn, fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 9999, marginBottom: 12 }}>
                ⚠ No resume — <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigate('/profile')}>upload in Profile</span>
              </div>
            )}

            <textarea
              value={aiInput.jd}
              onChange={e => setAiInput(p => ({ ...p, jd: e.target.value }))}
              placeholder="Paste the full job description…"
              style={{ width: '100%', height: 120, resize: 'vertical', background: T.s2, border: `1px solid ${T.hairline}`, borderRadius: 6, padding: '9px 10px', fontSize: 13, color: T.ink, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 10 }}
            />
            <button onClick={handleMatchScore} disabled={aiLoading || !aiInput.jd} className="rwy-btn"
              style={{ background: T.accent, color: '#fff', border: 'none', cursor: 'pointer', padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, opacity: (!aiInput.jd || aiLoading) ? 0.5 : 1 }}>
              {aiLoading ? 'Analysing…' : 'Get score →'}
            </button>

            {aiResult && (
              <div style={{ marginTop: 14 }}>
                {resumeSource === 'profile' && <div style={{ fontSize: 11, color: T.inkTertiary, marginBottom: 6 }}>Matched against your saved resume</div>}
                <div style={{ background: T.s2, border: `1px solid ${T.hairline}`, borderRadius: 8, padding: 14, fontSize: 13, color: T.inkMuted, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {aiResult}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── AI panel: suggest ── */}
        {aiPanel === 'suggest' && (
          <div style={{ background: T.s1, border: `1px solid ${T.hairline}`, borderRadius: 10, padding: 20, marginBottom: 24, animation: 'fadeIn 0.18s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>💡 Suggestions</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleSuggest} style={{ background: T.s2, color: T.inkMuted, border: `1px solid ${T.hairline}`, cursor: 'pointer', padding: '5px 10px', borderRadius: 6, fontSize: 11 }}>Refresh</button>
                <button onClick={() => setAiPanel(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, color: T.inkTertiary, lineHeight: 1 }}>×</button>
              </div>
            </div>
            {aiLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.inkTertiary, fontSize: 13 }}>
                <div style={{ width: 14, height: 14, border: `2px solid ${T.hairline}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Reviewing your pipeline…
              </div>
            ) : suggestions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {suggestions.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: T.s2, border: `1px solid ${T.hairline}`, borderRadius: 8, padding: '9px 12px', fontSize: 13 }}>
                    <span style={{ flexShrink: 0 }}>{s.emoji || '→'}</span>
                    <div>
                      {s.company && <span style={{ fontWeight: 600, color: T.ink }}>{s.company} · </span>}
                      <span style={{ color: T.inkMuted }}>{s.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: T.inkTertiary, fontSize: 13 }}>No suggestions yet — add some applications first.</div>
            )}
          </div>
        )}

        {/* ── Kanban board ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {COLUMNS.map(col => {
            const colAppsArr = colApps(col.key);
            return (
              <div key={col.key}>
                {/* Column header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '0 2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: col.dot }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: T.inkSubtle, letterSpacing: '0.2px' }}>{col.label}</span>
                  </div>
                  <span style={{ fontSize: 11, color: T.inkTertiary, fontWeight: 500 }}>{colAppsArr.length}</span>
                </div>

                {/* Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 80 }}>
                  {colAppsArr.map(app => (
                    <div
                      key={app._id}
                      className="rwy-card"
                      onClick={() => openEdit(app)}
                      style={{
                        background: T.s1, border: `1px solid ${T.hairline}`,
                        borderRadius: 10, padding: '11px 13px',
                        cursor: 'pointer', transition: 'background 0.12s, border-color 0.12s',
                        animation: 'fadeIn 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 7,
                          background: T.s3,
                          border: `1px solid ${T.hairline}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700, color: T.inkSubtle, flexShrink: 0,
                        }}>
                          {initials(app.company)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, lineHeight: 1.3 }}>{app.company}</div>
                          <div style={{ fontSize: 11, color: T.inkTertiary, marginTop: 1 }}>{app.role}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 10, color: T.inkTertiary }}>{daysAgo(app.createdAt)}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {app.score !== undefined && app.score !== null && (
                            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, ...scoreBadgeStyle(app.score) }}>
                              {parseFloat(app.score).toFixed(1)}
                            </span>
                          )}
                          {app.jobUrl && (
                            <a href={app.jobUrl} target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              style={{ fontSize: 10, color: T.accent, textDecoration: 'none', fontWeight: 500 }}>
                              View →
                            </a>
                          )}
                        </div>
                      </div>

                      {app.notes && (
                        <div style={{ marginTop: 8, fontSize: 11, color: T.inkTertiary, lineHeight: 1.5, background: T.s2, borderRadius: 5, padding: '5px 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {app.notes}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Empty state */}
                  {colAppsArr.length === 0 && (
                    <div style={{ border: `1px dashed ${T.hairline}`, borderRadius: 10, padding: '20px 14px', textAlign: 'center', color: T.inkTertiary, fontSize: 12 }}>
                      Empty
                    </div>
                  )}

                  {/* Add ghost */}
                  <button
                    onClick={openAdd}
                    style={{ background: 'transparent', border: `1px dashed ${T.hairline}`, borderRadius: 10, padding: '8px', fontSize: 11, color: T.inkTertiary, cursor: 'pointer', textAlign: 'center' }}
                  >+ Add</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Modal ── */}
      {showAdd && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}
          onClick={e => e.target === e.currentTarget && (setShowAdd(false), setEditApp(null))}
        >
          <div style={{ background: T.s1, border: `1px solid ${T.hairlineStrong}`, borderRadius: 14, width: '100%', maxWidth: 500, padding: 26, animation: 'fadeIn 0.15s ease', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: T.ink, margin: 0, letterSpacing: '-0.3px' }}>
                {editApp ? 'Edit application' : 'Add application'}
              </h2>
              <button onClick={() => { setShowAdd(false); setEditApp(null); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20, color: T.inkTertiary, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Company', key: 'company', placeholder: 'e.g. Razorpay' },
                { label: 'Role', key: 'role', placeholder: 'e.g. SDE-1 · Backend' },
                { label: 'Job URL', key: 'jobUrl', placeholder: 'https://wellfound.com/jobs/…' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 500, color: T.inkTertiary, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: '100%', background: T.s2, border: `1px solid ${T.hairline}`, borderRadius: 7, padding: '8px 10px', fontSize: 13, color: T.ink, boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
              ))}

              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: T.inkTertiary, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5 }}>Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  style={{ width: '100%', background: T.s2, border: `1px solid ${T.hairline}`, borderRadius: 7, padding: '8px 10px', fontSize: 13, color: T.ink, boxSizing: 'border-box', fontFamily: 'inherit', appearance: 'auto' }}
                >
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: T.inkTertiary, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5 }}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Interview prep, referral contact, salary info…"
                  rows={3}
                  style={{ width: '100%', background: T.s2, border: `1px solid ${T.hairline}`, borderRadius: 7, padding: '8px 10px', fontSize: 13, color: T.ink, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'space-between' }}>
              <div>
                {editApp && (
                  <button onClick={() => handleDelete(editApp._id)}
                    style={{ background: 'transparent', color: T.danger, border: `1px solid ${T.danger}40`, borderRadius: 7, padding: '8px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                    Delete
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setShowAdd(false); setEditApp(null); }}
                  style={{ background: 'transparent', color: T.inkSubtle, border: `1px solid ${T.hairline}`, borderRadius: 7, padding: '8px 14px', fontSize: 12, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="rwy-btn"
                  style={{ background: T.accent, color: '#fff', border: 'none', borderRadius: 7, padding: '8px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  {saving ? 'Saving…' : editApp ? 'Save' : 'Add →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
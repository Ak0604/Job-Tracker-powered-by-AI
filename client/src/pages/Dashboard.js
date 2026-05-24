import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const N = {
  navy: '#0a1530',
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
  muted: '#bbb8b1',
  onDark: '#ffffff',
  peach: '#ffe8d4',
  rose: '#fde0ec',
  mint: '#d9f3e1',
  lavender: '#e6e0f5',
  sky: '#dcecfa',
  yellow: '#fef7d6',
  yellowBold: '#f9e79f',
  brandGreen: '#1aae39',
  brandOrange: '#dd5b00',
  orangeDeep: '#793400',
  purpleDeep: '#391c57',
  greenDark: '#0f6e56',
  blueDark: '#185fa5',
};

const COLUMNS = [
  { key: 'Applied', label: 'Applied', badgeBg: N.sky, badgeColor: N.blueDark, cardAccent: '#dcecfa' },
  { key: 'Interview', label: 'Interview', badgeBg: N.yellow, badgeColor: N.orangeDeep, cardAccent: '#fef7d6' },
  { key: 'Offer', label: 'Offer 🎉', badgeBg: N.mint, badgeColor: N.greenDark, cardAccent: '#d9f3e1' },
  { key: 'Rejected', label: 'Rejected', badgeBg: N.surface, badgeColor: N.steel, cardAccent: '#f0eeec' },
];

const STATUS_OPTIONS = ['Applied', 'Interview', 'Offer', 'Rejected'];

function daysAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}

function initials(company) {
  return company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ['#e6e0f5', '#dcecfa', '#d9f3e1', '#ffe8d4', '#fde0ec', '#fef7d6'];
function avatarBg(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

const EMPTY_FORM = { company: '', role: '', status: 'Applied', jobUrl: '', notes: '' };

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editApp, setEditApp] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [aiPanel, setAiPanel] = useState(null); // 'match' | 'suggest'
  const [aiInput, setAiInput] = useState({ jd: '', resume: '' });
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [autofillUrl, setAutofillUrl] = useState('');
  const [autofilling, setAutofilling] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const fetchApps = useCallback(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/applications`)
      .then(res => { setApps(res.data); setLoading(false); })
      .catch(err => {
        if (err.response?.status === 401) { logout(); navigate('/login'); }
        setLoading(false);
      });
  }, [logout, navigate]);

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
      fetchApps();
      setShowAdd(false);
      setEditApp(null);
      setForm(EMPTY_FORM);
    } catch (e) {
      if (e.response?.status === 401) { logout(); navigate('/login'); }
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    await axios.delete(`${process.env.REACT_APP_API_URL}/api/applications/${id}`);
    fetchApps();
    setEditApp(null);
  };

  const openEdit = (app) => {
    setEditApp(app);
    setForm({ company: app.company, role: app.role, status: app.status, jobUrl: app.jobUrl || '', notes: app.notes || '' });
    setShowAdd(true);
  };

  const openAdd = () => {
    setEditApp(null);
    setForm(EMPTY_FORM);
    setShowAdd(true);
  };

  const handleAutofill = async () => {
    if (!autofillUrl) return;
    setAutofilling(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/autofill`, { url: autofillUrl });
      setForm(prev => ({ ...prev, ...res.data }));
      setAutofillUrl('');
      setShowAdd(true);
    } catch {
      alert('Auto-fill failed. Try adding manually.');
    }
    setAutofilling(false);
  };

  const handleMatchScore = async () => {
    if (!aiInput.jd || !aiInput.resume) return;
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/match`, aiInput);
      setAiResult(res.data.result);
    } catch { setAiResult('Error getting match score. Please try again.'); }
    setAiLoading(false);
  };

  const handleSuggest = async () => {
    setAiLoading(true);
    setSuggestions([]);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/suggest`, { applications: apps });
      setSuggestions(res.data.suggestions || []);
    } catch { setSuggestions([{ text: 'Error fetching suggestions. Please try again.' }]); }
    setAiLoading(false);
  };

  const colApps = (key) => apps.filter(a => a.status === key);
  const stats = COLUMNS.map(c => ({ ...c, count: colApps(c.key).length }));

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: N.surfaceSoft, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: `3px solid ${N.hairline}`, borderTopColor: N.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ fontSize: 14, color: N.slate }}>Loading your applications…</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: N.surfaceSoft, minHeight: '100vh', color: N.ink }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .k-card-hover:hover { border-color: ${N.hairlineStrong} !important; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .btn-hover:hover { opacity: 0.85; }
        textarea:focus, input:focus, select:focus { outline: 2px solid ${N.primary} !important; outline-offset: 0; }
      `}</style>

      {/* TOP NAV */}
      <nav style={{ background: N.canvas, borderBottom: `1px solid ${N.hairline}`, height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 0, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, color: N.ink, marginRight: 'auto', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 26, height: 26, background: N.ink, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12 }}>JT</div>
          JobTracker
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: N.slate }}>Hi, {user?.name?.split(' ')[0] || 'there'} 👋</span>
          <button onClick={() => setAiPanel(aiPanel === 'match' ? null : 'match')}
            style={{ fontSize: 12, fontWeight: 500, color: N.primary, background: N.lavender, border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 6 }}>
            ✦ Resume Match
          </button>
          <button onClick={() => { setAiPanel(aiPanel === 'suggest' ? null : 'suggest'); if (aiPanel !== 'suggest') handleSuggest(); }}
            style={{ fontSize: 12, fontWeight: 500, color: N.orangeDeep, background: N.peach, border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 6 }}>
            💡 Smart Suggestions
          </button>
          <button onClick={() => { logout(); navigate('/login'); }}
            style={{ fontSize: 12, color: N.slate, background: 'transparent', border: `1px solid ${N.hairline}`, cursor: 'pointer', padding: '6px 12px', borderRadius: 6 }}>
            Log out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 600, color: N.ink, letterSpacing: '-0.5px', margin: 0 }}>My Applications</h1>
            <p style={{ fontSize: 14, color: N.slate, marginTop: 4 }}>{apps.length} application{apps.length !== 1 ? 's' : ''} tracked</p>
          </div>
          <button onClick={openAdd} className="btn-hover"
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: N.primary, color: '#fff', border: 'none', cursor: 'pointer', padding: '10px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500 }}>
            + Add Application
          </button>
        </div>

        {/* STATS BAR */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.key} style={{ background: N.canvas, border: `1px solid ${N.hairline}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: N.stone, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{s.label.replace(' 🎉', '')}</div>
                <div style={{ fontSize: 28, fontWeight: 600, color: N.ink, lineHeight: 1 }}>{s.count}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 9999, background: s.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                {s.key === 'Applied' ? '📋' : s.key === 'Interview' ? '💬' : s.key === 'Offer' ? '🎉' : '❌'}
              </div>
            </div>
          ))}
        </div>

        {/* AUTO-FILL BAR */}
        <div style={{ background: N.yellowBold, borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: N.charcoal, whiteSpace: 'nowrap' }}>✦ Auto-fill from URL</span>
          <input
            value={autofillUrl}
            onChange={e => setAutofillUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAutofill()}
            placeholder="Paste a job URL from Wellfound, LinkedIn, or any job board…"
            style={{ flex: 1, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: N.ink, outline: 'none' }}
          />
          <button onClick={handleAutofill} disabled={autofilling} className="btn-hover"
            style={{ background: N.primary, color: '#fff', border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>
            {autofilling ? 'Filling…' : 'Auto-fill →'}
          </button>
        </div>

        {/* AI PANEL */}
        {aiPanel === 'match' && (
          <div style={{ background: N.canvas, border: `1px solid ${N.hairline}`, borderRadius: 12, padding: 24, marginBottom: 24, animation: 'fadeIn 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: N.ink }}>✦ Resume Match Score</div>
              <button onClick={() => setAiPanel(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, color: N.stone }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: N.stone, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Job Description</div>
                <textarea value={aiInput.jd} onChange={e => setAiInput(p => ({ ...p, jd: e.target.value }))}
                  placeholder="Paste the full job description here…"
                  style={{ width: '100%', height: 140, resize: 'vertical', background: N.surface, border: `1px solid ${N.hairline}`, borderRadius: 8, padding: '10px 12px', fontSize: 13, color: N.ink, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: N.stone, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Your Resume</div>
                <textarea value={aiInput.resume} onChange={e => setAiInput(p => ({ ...p, resume: e.target.value }))}
                  placeholder="Paste your resume text here…"
                  style={{ width: '100%', height: 140, resize: 'vertical', background: N.surface, border: `1px solid ${N.hairline}`, borderRadius: 8, padding: '10px 12px', fontSize: 13, color: N.ink, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
            </div>
            <button onClick={handleMatchScore} disabled={aiLoading} className="btn-hover"
              style={{ background: N.primary, color: '#fff', border: 'none', cursor: 'pointer', padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
              {aiLoading ? 'Analysing…' : 'Get Match Score →'}
            </button>
            {aiResult && (
              <div style={{ marginTop: 16, background: N.lavender, borderRadius: 8, padding: 16, fontSize: 13, color: N.charcoal, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {aiResult}
              </div>
            )}
          </div>
        )}

        {aiPanel === 'suggest' && (
          <div style={{ background: N.canvas, border: `1px solid ${N.hairline}`, borderRadius: 12, padding: 24, marginBottom: 24, animation: 'fadeIn 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: N.ink }}>💡 Smart Suggestions</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleSuggest} style={{ background: N.peach, color: N.orangeDeep, border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>Refresh</button>
                <button onClick={() => setAiPanel(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, color: N.stone }}>×</button>
              </div>
            </div>
            {aiLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: N.slate, fontSize: 13 }}>
                <div style={{ width: 16, height: 16, border: `2px solid ${N.hairline}`, borderTopColor: N.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Claude is reviewing your applications…
              </div>
            ) : suggestions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {suggestions.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: N.surface, borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                    <span style={{ flexShrink: 0 }}>{s.emoji || '→'}</span>
                    <div>
                      {s.company && <span style={{ fontWeight: 600, color: N.ink }}>{s.company} · </span>}
                      <span style={{ color: N.slate }}>{s.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: N.stone, fontSize: 13 }}>No suggestions yet. Add some applications first!</div>
            )}
          </div>
        )}

        {/* KANBAN */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {COLUMNS.map(col => {
            const colAppsArr = colApps(col.key);
            return (
              <div key={col.key}>
                {/* Column Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 4px' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: N.charcoal, letterSpacing: '0.3px' }}>{col.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: col.badgeBg, color: col.badgeColor }}>
                    {colAppsArr.length}
                  </span>
                </div>

                {/* Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 120 }}>
                  {colAppsArr.map(app => (
                    <div key={app._id} className="k-card-hover"
                      onClick={() => openEdit(app)}
                      style={{ background: N.canvas, border: `1px solid ${N.hairline}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s', animation: 'fadeIn 0.2s ease' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: avatarBg(app.company), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: N.charcoal, flexShrink: 0 }}>
                          {initials(app.company)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: N.ink, lineHeight: 1.3 }}>{app.company}</div>
                          <div style={{ fontSize: 11, color: N.slate, marginTop: 1 }}>{app.role}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 10, color: N.stone }}>{daysAgo(app.createdAt)}</span>
                        {app.jobUrl && (
                          <a href={app.jobUrl} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ fontSize: 10, color: N.primary, textDecoration: 'none', fontWeight: 500 }}>
                            View →
                          </a>
                        )}
                      </div>
                      {app.notes && (
                        <div style={{ marginTop: 8, fontSize: 11, color: N.slate, lineHeight: 1.5, background: N.surface, borderRadius: 6, padding: '6px 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {app.notes}
                        </div>
                      )}
                    </div>
                  ))}

                  {colAppsArr.length === 0 && (
                    <div style={{ border: `1.5px dashed ${N.hairline}`, borderRadius: 12, padding: '24px 16px', textAlign: 'center', color: N.muted, fontSize: 12 }}>
                      No applications yet
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,21,48,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}
          onClick={(e) => e.target === e.currentTarget && (setShowAdd(false), setEditApp(null))}>
          <div style={{ background: N.canvas, borderRadius: 16, width: '100%', maxWidth: 520, padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.15)', animation: 'fadeIn 0.15s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: N.ink, margin: 0 }}>
                {editApp ? 'Edit Application' : 'Add Application'}
              </h2>
              <button onClick={() => { setShowAdd(false); setEditApp(null); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20, color: N.stone, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Company', key: 'company', placeholder: 'e.g. Razorpay' },
                { label: 'Role', key: 'role', placeholder: 'e.g. SDE-1 · Backend' },
                { label: 'Job URL', key: 'jobUrl', placeholder: 'https://wellfound.com/jobs/...' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: N.stone, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: '100%', background: N.surface, border: `1px solid ${N.hairline}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, color: N.ink, boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: N.stone, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  style={{ width: '100%', background: N.surface, border: `1px solid ${N.hairline}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, color: N.ink, boxSizing: 'border-box', fontFamily: 'inherit', appearance: 'auto' }}>
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: N.stone, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Interview prep notes, referral contact, salary info…"
                  rows={3}
                  style={{ width: '100%', background: N.surface, border: `1px solid ${N.hairline}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, color: N.ink, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'space-between' }}>
              <div>
                {editApp && (
                  <button onClick={() => handleDelete(editApp._id)}
                    style={{ background: 'transparent', color: '#e03131', border: '1px solid #ffc9c9', borderRadius: 8, padding: '9px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                    Delete
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setShowAdd(false); setEditApp(null); }}
                  style={{ background: 'transparent', color: N.slate, border: `1px solid ${N.hairline}`, borderRadius: 8, padding: '9px 16px', fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="btn-hover"
                  style={{ background: N.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  {saving ? 'Saving…' : editApp ? 'Save changes' : 'Add →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
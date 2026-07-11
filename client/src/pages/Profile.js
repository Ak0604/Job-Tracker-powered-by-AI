import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL;

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
  danger:         '#c94a4a',
};

function Nav({ user, logout, navigate }) {
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: T.s1, borderBottom: `1px solid ${T.hairline}`, height: 52, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 0 }}>
      <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginRight: 32 }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect width="20" height="20" rx="5" fill={T.accent}/>
          <path d="M5 14 L10 6 L15 14" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
        </svg>
        <span style={{ fontSize: 14, fontWeight: 600, color: T.ink, letterSpacing: '-0.3px' }}>Runway</span>
      </div>
      <div style={{ display: 'flex', gap: 2, flex: 1 }}>
        {[{ label: 'Pipeline', path: '/dashboard' }, { label: 'Evaluate', path: '/evaluate' }].map(({ label, path }) => (
          <button key={label} onClick={() => navigate(path)}
            style={{ fontSize: 13, fontWeight: 500, color: T.inkSubtle, background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: 6 }}>
            {label}
          </button>
        ))}
      </div>
      <button onClick={() => { logout(); navigate('/login'); }}
        style={{ fontSize: 12, color: T.inkTertiary, background: 'transparent', border: `1px solid ${T.hairline}`, cursor: 'pointer', padding: '5px 10px', borderRadius: 6 }}>
        Log out
      </button>
    </nav>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const fileRef          = useRef();

  const [resumeStatus, setResumeStatus] = useState(null);
  const [uploading, setUploading]       = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [message, setMessage]           = useState(null);
  const [preview, setPreview]           = useState('');
  const [dragOver, setDragOver]         = useState(false);

  useEffect(() => { fetchResumeStatus(); }, []);

  const fetchResumeStatus = async () => {
    try {
      const res = await axios.get(`${API}/api/user/resume`);
      setResumeStatus(res.data);
    } catch {
      setMessage({ type: 'error', text: 'Could not fetch resume status.' });
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') { setMessage({ type: 'error', text: 'Only PDF files are supported.' }); return; }
    if (file.size > 5 * 1024 * 1024)    { setMessage({ type: 'error', text: 'File too large. Max size is 5MB.' }); return; }

    setUploading(true); setMessage(null); setPreview('');
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await axios.post(`${API}/api/user/resume`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPreview(res.data.preview);
      setMessage({ type: 'success', text: 'Resume saved. Match scoring will use this automatically.' });
      fetchResumeStatus();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Remove your saved resume?')) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/user/resume`);
      setResumeStatus({ hasResume: false, updatedAt: null });
      setPreview('');
      setMessage({ type: 'success', text: 'Resume removed.' });
    } catch {
      setMessage({ type: 'error', text: 'Could not remove resume.' });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: T.canvas, minHeight: '100vh', color: T.ink }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .rwy-drop:hover { border-color: ${T.accent}80 !important; }
        .rwy-drop.drag-over { border-color: ${T.accent} !important; background: ${T.accent}0a !important; }
        .rwy-btn-p:hover { background: ${T.accentHover} !important; }
        input:focus { outline: 2px solid ${T.accent}80 !important; outline-offset: 0; }
      `}</style>

      <Nav user={user} logout={logout} navigate={navigate} />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>

        {/* ── User header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, padding: '20px 24px', background: T.s1, border: `1px solid ${T.hairline}`, borderRadius: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.ink, letterSpacing: '-0.3px' }}>{user?.name || 'Your Profile'}</div>
            <div style={{ fontSize: 13, color: T.inkTertiary, marginTop: 2 }}>{user?.email || ''}</div>
          </div>
          <button onClick={() => navigate('/dashboard')}
            style={{ fontSize: 12, color: T.inkSubtle, background: T.s2, border: `1px solid ${T.hairline}`, cursor: 'pointer', padding: '6px 12px', borderRadius: 6 }}>
            ← Pipeline
          </button>
        </div>

        {/* ── Resume section ── */}
        <div style={{ background: T.s1, border: `1px solid ${T.hairline}`, borderRadius: 12, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: T.ink, letterSpacing: '-0.3px', margin: '0 0 5px' }}>Saved Resume</h2>
              <p style={{ fontSize: 13, color: T.inkTertiary, margin: 0, lineHeight: 1.5 }}>
                Upload once — Resume Match uses this automatically.
              </p>
            </div>
            {resumeStatus?.hasResume && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: T.success + '18', border: `1px solid ${T.success}40`, color: T.success, fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 9999, flexShrink: 0 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.success }} />
                Active
              </div>
            )}
          </div>

          {/* Current resume row */}
          {resumeStatus?.hasResume && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.s2, border: `1px solid ${T.hairline}`, borderRadius: 8, padding: '11px 14px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>📄</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.ink }}>Resume on file</div>
                  <div style={{ fontSize: 11, color: T.inkTertiary, marginTop: 2 }}>Last updated {formatDate(resumeStatus.updatedAt)}</div>
                </div>
              </div>
              <button onClick={handleDelete} disabled={deleting}
                style={{ fontSize: 12, color: T.danger, background: 'transparent', border: `1px solid ${T.danger}40`, cursor: 'pointer', padding: '5px 10px', borderRadius: 6 }}>
                {deleting ? 'Removing…' : 'Remove'}
              </button>
            </div>
          )}

          {/* Drop zone */}
          <div
            className={`rwy-drop${dragOver ? ' drag-over' : ''}`}
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            style={{ border: `1.5px dashed ${T.hairlineStrong}`, borderRadius: 10, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s', background: T.s2 }}
          >
            <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            {uploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 22, height: 22, border: `2px solid ${T.hairline}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 13, color: T.inkSubtle }}>Parsing resume with AI…</span>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 22, marginBottom: 10, color: T.inkTertiary }}>↑</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.inkMuted, marginBottom: 4 }}>
                  {resumeStatus?.hasResume ? 'Upload a new resume to replace' : 'Drop your resume here'}
                </div>
                <div style={{ fontSize: 11, color: T.inkTertiary }}>PDF only · Max 5MB · Click or drag & drop</div>
              </div>
            )}
          </div>

          {/* Message */}
          {message && (
            <div style={{ marginTop: 12, background: message.type === 'success' ? T.success + '18' : T.danger + '18', border: `1px solid ${message.type === 'success' ? T.success + '40' : T.danger + '40'}`, color: message.type === 'success' ? T.success : T.danger, borderRadius: 8, padding: '9px 12px', fontSize: 13 }}>
              {message.type === 'success' ? '✓' : '✕'} {message.text}
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div style={{ marginTop: 14, background: T.s3, border: `1px solid ${T.hairline}`, borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: T.inkTertiary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Extracted preview</div>
              <div style={{ fontSize: 12, color: T.inkSubtle, lineHeight: 1.65, whiteSpace: 'pre-wrap', maxHeight: 160, overflow: 'auto' }}>{preview}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
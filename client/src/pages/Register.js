import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const T = {
  canvas:      '#010102',
  s1:          '#0f1011',
  s2:          '#141516',
  hairline:    '#23252a',
  ink:         '#f7f8f8',
  inkMuted:    '#d0d6e0',
  inkTertiary: '#62666d',
  accent:      '#5e6ad2',
  danger:      '#c94a4a',
};

const Register = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.canvas, fontFamily: "'Inter', system-ui, sans-serif", padding: '1rem' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`input:focus { outline: 2px solid ${T.accent}80 !important; outline-offset: 0; } .rwy-btn:hover { background: #828fff !important; }`}</style>

      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, cursor: 'pointer', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect width="20" height="20" rx="5" fill={T.accent}/>
            <path d="M5 14 L10 6 L15 14" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
          </svg>
          <span style={{ fontSize: 15, fontWeight: 600, color: T.ink, letterSpacing: '-0.3px' }}>Runway</span>
        </div>

        {/* Card */}
        <div style={{ background: T.s1, border: `1px solid ${T.hairline}`, borderRadius: 14, padding: '32px 28px' }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: T.ink, letterSpacing: '-0.4px', margin: '0 0 4px' }}>Create account</h1>
          <p style={{ fontSize: 13, color: T.inkTertiary, margin: '0 0 24px' }}>Start tracking your applications</p>

          {error && (
            <div style={{ background: T.danger + '18', border: `1px solid ${T.danger}40`, color: T.danger, borderRadius: 8, padding: '9px 12px', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Name',     name: 'name',     type: 'text',     placeholder: 'Atharva' },
              { label: 'Email',    name: 'email',    type: 'email',    placeholder: 'you@example.com' },
              { label: 'Password', name: 'password', type: 'password', placeholder: 'Min. 6 characters' },
            ].map(f => (
              <div key={f.name}>
                <label style={{ fontSize: 11, fontWeight: 500, color: T.inkTertiary, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 5, marginTop: 10 }}>{f.label}</label>
                <input
                  type={f.type} name={f.name} value={form[f.name]}
                  onChange={handleChange} placeholder={f.placeholder} required
                  style={{ width: '100%', background: T.s2, border: `1px solid ${T.hairline}`, borderRadius: 7, padding: '9px 11px', fontSize: 13, color: T.ink, fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
            ))}

            <button type="submit" disabled={loading} className="rwy-btn"
              style={{ marginTop: 20, padding: '10px', borderRadius: 7, border: 'none', background: T.accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'background 0.12s' }}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: T.inkTertiary, marginTop: 20, marginBottom: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: T.accent, fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
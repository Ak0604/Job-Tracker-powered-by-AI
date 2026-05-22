import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to your job tracker</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            style={styles.input}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f0',
    // CORRECT
fontFamily: 'Geist, system-ui, sans-serif',
    padding: '1rem',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #e5e5e0',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 4px',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    margin: '0 0 1.5rem',
  },
  error: {
    background: '#fff0f0',
    color: '#c0392b',
    border: '1px solid #fdd',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#555',
    marginTop: '10px',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e0e0d8',
    fontSize: '14px',
    outline: 'none',
    background: '#fafaf8',
    color: '#1a1a1a',
  },
  button: {
    marginTop: '1.25rem',
    padding: '11px',
    borderRadius: '8px',
    border: 'none',
    background: '#1a1a1a',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#888',
    marginTop: '1.25rem',
    marginBottom: 0,
  },
  link: {
    color: '#1a1a1a',
    fontWeight: '500',
  },
};

export default Login;
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Attach token to every axios request automatically
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // On first load, decode the stored token to restore user info
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload.user); // { id: '...' } — from your JWT sign payload
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/auth/login`,
      { email, password }
    );
    const newToken = res.data.token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    const payload = JSON.parse(atob(newToken.split('.')[1]));
    setUser(payload.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/auth/register`,
      { name, email, password }
    );
    const newToken = res.data.token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    const payload = JSON.parse(atob(newToken.split('.')[1]));
    setUser(payload.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
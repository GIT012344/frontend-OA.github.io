import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      // Decode token เพื่อดึงข้อมูลผู้ใช้
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUser(decoded);
    } else {
      setUser(null);
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await axios.post('https://backend-oa-pqy2.onrender.com/api/login', {
        username,
        password
      });

      const newToken = response.data.access_token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
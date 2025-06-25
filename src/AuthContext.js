import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Mock PIN codes สำหรับทดสอบ
const MOCK_PIN_CODES = {
  '123456': {
    username: 'admin',
    name: 'ผู้ดูแลระบบ',
    role: 'admin',
    email: 'admin@example.com'
  },
  '654321': {
    username: 'user',
    name: 'ผู้ใช้งานทั่วไป',
    role: 'user',
    email: 'user@example.com'
  },
  '111111': {
    username: 'test',
    name: 'ผู้ทดสอบ',
    role: 'user',
    email: 'test@example.com'
  }
};

// Helper function to safely encode strings with non-Latin1 characters
const safeBtoa = (str) => {
  return btoa(unescape(encodeURIComponent(str)));
};

// Helper function to safely decode strings
const safeAtob = (str) => {
  return decodeURIComponent(escape(atob(str)));
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        // ถ้าเป็น mock token ให้ decode จาก localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          // ถ้าไม่มี userData ให้ลบ token
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setToken(null);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (pinCode) => {
    try {
      // ตรวจสอบ PIN code ใน mock data
      if (MOCK_PIN_CODES[pinCode]) {
        const userData = MOCK_PIN_CODES[pinCode];
        
        // สร้าง mock token ด้วย safe encoding
        const tokenData = {
          ...userData,
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 ชั่วโมง
          iat: Math.floor(Date.now() / 1000)
        };
        
        const mockToken = safeBtoa(JSON.stringify(tokenData));
        
        // บันทึก token และ user data
        setToken(mockToken);
        setUser(userData);
        localStorage.setItem('token', mockToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        console.log('✅ Mock login successful:', userData);
        return true;
      } else {
        // ถ้า PIN ไม่ถูกต้อง ให้ลองเรียก Backend API
        try {
          const response = await axios.post('https://backend-oa-pqy2.onrender.com/api/login', {
            pin_code: pinCode
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (response.data.access_token) {
            const newToken = response.data.access_token;
            setToken(newToken);
            localStorage.setItem('token', newToken);
            
            // Decode และ set user data
            try {
              const decoded = JSON.parse(safeAtob(newToken.split('.')[1]));
              setUser(decoded);
            } catch (error) {
              console.error('Error decoding token:', error);
            }
            
            return true;
          } else {
            throw new Error('No access token received');
          }
        } catch (backendError) {
          console.error('Backend login failed:', backendError);
          throw new Error('PIN code ไม่ถูกต้อง');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
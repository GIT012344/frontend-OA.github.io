import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import AuthManager from '../utils/auth';
import {
  AuthContainer,
  AuthCard,
  AuthTitle,
  FormGroup,
  Label,
  Input,
  Button
} from './styled/AuthStyles';

const PinVerification = () => {
  const navigate = useNavigate();
  const { user, verifyPin, logout } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in but needs PIN verification
    if (!AuthManager.isLoggedIn()) {
      navigate('/login');
      return;
    }

    if (!AuthManager.requiresPinVerification()) {
      navigate('/dashboard');
      return;
    }

    // User data comes from AuthContext
  }, [navigate]);

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only numbers
    if (value.length <= 6) {
      setPin(value);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!pin || pin.length < 6) {
      setError('กรุณากรอก PIN 6 หลัก');
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyPin(pin);
      
      if (result.success) {
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(result.error || 'PIN ไม่ถูกต้อง');
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      setError('เกิดข้อผิดพลาดในการยืนยัน PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <AuthContainer>
      <AuthCard>
        <AuthTitle>ยืนยัน PIN</AuthTitle>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>
          สวัสดี {user.displayName || user.username}<br/>
          กรุณากรอก PIN เพื่อเข้าใช้งานระบบ
        </p>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>PIN (6 หลัก)</Label>
            <Input
              type="password"
              value={pin}
              onChange={handlePinChange}
              placeholder="••••••"
              maxLength="6"
              style={{
                textAlign: 'center',
                fontSize: '1.5rem',
                letterSpacing: '0.5rem'
              }}
              autoFocus
            />
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#64748b', 
              textAlign: 'center',
              marginTop: '8px'
            }}>
              ใช้ PIN เดิมที่ตั้งไว้ในระบบ (เช่น 123456)
            </div>
          </FormGroup>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              color: '#dc2626',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button 
              type="submit" 
              disabled={isLoading || pin.length !== 6}
              style={{ flex: 1 }}
            >
              {isLoading ? 'กำลังยืนยัน...' : 'ยืนยัน PIN'}
            </Button>
            
            <Button
              type="button"
              onClick={handleLogout}
              style={{
                background: '#6b7280',
                borderColor: '#6b7280'
              }}
            >
              ออกจากระบบ
            </Button>
          </div>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#64748b',
          textAlign: 'center'
        }}>
          🔒 PIN ใช้สำหรับยืนยันตัวตนเพิ่มเติมเพื่อความปลอดภัย
        </div>
      </AuthCard>

      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      )}
    </AuthContainer>
  );
};

export default PinVerification;

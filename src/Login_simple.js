import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  AuthContainer,
  AuthCard,
  AuthTitle,
  FormGroup,
  Label,
  Input,
  Button
} from './components/styled/AuthStyles';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check for messages from registration
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state.username) {
        setFormData(prev => ({ ...prev, username: location.state.username }));
      }
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.username || !formData.password) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        // Login successful, redirect to PIN verification
        navigate('/pin-verification');
      } else {
        setError(result.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthTitle>เข้าสู่ระบบ Helpdesk</AuthTitle>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>
          กรุณาเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่าน
        </p>

        {successMessage && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            color: '#16a34a',
            textAlign: 'center'
          }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>ชื่อผู้ใช้</Label>
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="ชื่อผู้ใช้"
              required
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <Label>รหัสผ่าน</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="รหัสผ่าน"
              required
            />
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

          <Button 
            type="submit" 
            disabled={isLoading}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              ยังไม่มีบัญชี? สมัครสมาชิก
            </button>
          </div>
        </form>

        {/* Info note about PIN */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#64748b',
          textAlign: 'center'
        }}>
          💡 <strong>หมายเหตุ:</strong> หลังเข้าสู่ระบบเสร็จ กรุณาใส่ PIN: 
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

export default Login;

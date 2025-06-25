import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from './AuthContext';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
`;

const LoginForm = styled.div`
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const LoginTitle = styled.h1`
  color: #1e293b;
  text-align: center;
  margin-bottom: 32px;
  font-weight: 700;
`;

const PinInput = styled.input`
  width: 100%;
  padding: 16px;
  margin-bottom: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  background: #f8fafc;

  &:focus {
    outline: none;
    border-color: #64748b;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.1);
    background: white;
  }

  &::placeholder {
    color: #94a3b8;
    letter-spacing: 4px;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #475569 0%, #64748b 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(71, 85, 105, 0.25);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  margin-top: 16px;
  text-align: center;
  font-weight: 500;
`;

const PinLabel = styled.div`
  text-align: center;
  color: #64748b;
  margin-bottom: 16px;
  font-size: 0.95rem;
`;

const PinHint = styled.div`
  text-align: center;
  color: #94a3b8;
  margin-top: 12px;
  font-size: 0.85rem;
`;

const TestPins = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: #f1f5f9;
  border-radius: 8px;
  border-left: 4px solid #64748b;
`;

const TestPinsTitle = styled.div`
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

const TestPinItem = styled.div`
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 4px;
`;

function Login({ setToken }) {
  const [pinCode, setPinCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // รับเฉพาะตัวเลข
    if (value.length <= 6) { // จำกัดความยาวไม่เกิน 6 หลัก
      setPinCode(value);
      setError(''); // ล้าง error เมื่อผู้ใช้พิมพ์
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (pinCode.length < 4) {
      setError('กรุณาใส่รหัส PIN อย่างน้อย 4 หลัก');
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(pinCode);
      if (success) {
        // ใช้ token จาก AuthContext
        const token = localStorage.getItem('token');
        setToken(token);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginForm>
        <LoginTitle>เข้าสู่ระบบ Helpdesk</LoginTitle>
        <PinLabel>กรุณาใส่รหัส PIN</PinLabel>
        <form onSubmit={handleSubmit}>
          <PinInput
            type="password"
            placeholder="••••••"
            value={pinCode}
            onChange={handlePinChange}
            maxLength={6}
            required
            autoFocus
          />
          <LoginButton type="submit" disabled={isLoading || pinCode.length < 4}>
            {isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </LoginButton>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </form>
        <PinHint>
          รหัส PIN ต้องมี 4-6 หลัก
        </PinHint>
        
        <TestPins>
          <TestPinsTitle>🔑 รหัส PIN สำหรับทดสอบ:</TestPinsTitle>
          <TestPinItem>• 123456 - ผู้ดูแลระบบ (Admin) - ใช้งานได้</TestPinItem>
          <TestPinItem>• 654321 - ผู้ใช้งานทั่วไป (User)</TestPinItem>
          <TestPinItem>• 111111 - ผู้ทดสอบ (Test)</TestPinItem>
        </TestPins>
      </LoginForm>
    </LoginContainer>
  );
}

export default Login;
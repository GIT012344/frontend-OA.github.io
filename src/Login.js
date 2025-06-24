import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

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

const InputField = styled.input`
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #64748b;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.1);
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #475569 0%, #64748b 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
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
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  margin-top: 16px;
  text-align: center;
`;

function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('https://backend-oa-pqy2.onrender.com/api/login', {
        username,
        password
      });

      const token = response.data.access_token;
      setToken(token);
      
      // บันทึก token ใน localStorage
      localStorage.setItem('token', token);
      
      // Redirect ไปหน้า dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      console.error('Login error:', err);
    }
  };

  return (
    <LoginContainer>
      <LoginForm>
        <LoginTitle>เข้าสู่ระบบ Helpdesk</LoginTitle>
        <form onSubmit={handleSubmit}>
          <InputField
            type="text"
            placeholder="ชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <InputField
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <LoginButton type="submit">เข้าสู่ระบบ</LoginButton>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </form>
      </LoginForm>
    </LoginContainer>
  );
}

export default Login;
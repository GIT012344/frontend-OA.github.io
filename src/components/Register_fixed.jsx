import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import FormValidator from '../utils/validation';
import {
  AuthContainer,
  AuthCard,
  AuthTitle,
  FormGroup,
  Label,
  Input,
  Button,
  HelperText
} from './styled/AuthStyles';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    displayName: ''
  });
  const [errors, setErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Real-time validation
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let isValid = true;
    
    switch (name) {
      case 'username':
        isValid = FormValidator.isValidUsername(value);
        setFieldErrors(prev => ({
          ...prev,
          username: isValid ? null : 'ชื่อผู้ใช้ต้องมี 3-50 ตัวอักษร'
        }));
        break;
      case 'password':
        isValid = FormValidator.isValidPassword(value);
        setFieldErrors(prev => ({
          ...prev,
          password: isValid ? null : 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
        }));
        break;
      case 'email':
        isValid = FormValidator.isValidEmail(value);
        setFieldErrors(prev => ({
          ...prev,
          email: isValid ? null : 'รูปแบบอีเมล์ไม่ถูกต้อง'
        }));
        break;
      case 'displayName':
        isValid = FormValidator.isValidName(value);
        setFieldErrors(prev => ({
          ...prev,
          displayName: isValid ? null : 'กรุณาใส่ชื่อ-นามสกุล'
        }));
        break;
      default:
        break;
    }
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage('');
    
    // Validate form
    const validationErrors = FormValidator.validateRegisterForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await authAPI.register(formData);
      
      if (result.success) {
        setSuccessMessage('สมัครสมาชิกสำเร็จ! กำลังนำไปหน้าเข้าสู่ระบบ...');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ',
              username: formData.username 
            } 
          });
        }, 2000);
      } else {
        setErrors([result.error]);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors(['เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง']);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return Object.values(formData).every(value => value.trim() !== '') &&
           Object.values(fieldErrors).every(error => error === null);
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthTitle>สมัครสมาชิก</AuthTitle>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>
          สร้างบัญชีใหม่เพื่อเข้าใช้งานระบบ Helpdesk
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <FormGroup>
              <Label>ชื่อผู้ใช้ *</Label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="ชื่อผู้ใช้"
                required
                minLength={3}
                maxLength={50}
              />
              {fieldErrors.username && (
                <HelperText style={{ color: '#ef4444' }}>
                  {fieldErrors.username}
                </HelperText>
              )}
              <HelperText>3-50 ตัวอักษร, ห้ามซ้ำกับผู้อื่น</HelperText>
            </FormGroup>

            <FormGroup>
              <Label>ชื่อ-นามสกุล *</Label>
              <Input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="ชื่อ-นามสกุล"
                required
              />
              {fieldErrors.displayName && (
                <HelperText style={{ color: '#ef4444' }}>
                  {fieldErrors.displayName}
                </HelperText>
              )}
            </FormGroup>
          </div>

          <FormGroup>
            <Label>อีเมล์ *</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@email.com"
              required
            />
            {fieldErrors.email && (
              <HelperText style={{ color: '#ef4444' }}>
                {fieldErrors.email}
              </HelperText>
            )}
            <HelperText>ใช้สำหรับติดต่อ</HelperText>
          </FormGroup>

          <FormGroup>
            <Label>รหัสผ่าน *</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="รหัสผ่าน"
              required
              minLength={6}
            />
            {fieldErrors.password && (
              <HelperText style={{ color: '#ef4444' }}>
                {fieldErrors.password}
              </HelperText>
            )}
            <HelperText>อย่างน้อย 6 ตัวอักษร</HelperText>
          </FormGroup>

          {errors.length > 0 && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              {errors.map((error, index) => (
                <div key={index} style={{ color: '#dc2626' }}>{error}</div>
              ))}
            </div>
          )}

          {successMessage && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              color: '#16a34a'
            }}>
              {successMessage}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={!isFormValid() || isLoading}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </Button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              มีบัญชีแล้ว? เข้าสู่ระบบ
            </button>
          </div>
        </form>
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

export default Register;

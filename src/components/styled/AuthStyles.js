import styled, { keyframes, css } from 'styled-components';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
`;



// Main Container
export const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
  padding: 20px;
  font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  
  @media (max-width: 768px) {
    padding: 10px;
    align-items: flex-start;
    padding-top: 40px;
  }
`;

// Form Container
export const AuthForm = styled.div`
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 450px;
  animation: ${fadeIn} 0.6s ease-out;
  border: 1px solid rgba(226, 232, 240, 0.5);
  
  @media (max-width: 768px) {
    padding: 30px 20px;
    margin: 0 10px;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 25px 15px;
    max-width: 100%;
  }
`;

// Alias for AuthForm
export const AuthCard = AuthForm;

// Title
export const AuthTitle = styled.h1`
  color: #1e293b;
  text-align: center;
  margin-bottom: 32px;
  font-weight: 700;
  font-size: 1.8rem;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
    margin-bottom: 24px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.4rem;
    margin-bottom: 20px;
  }
`;

// Subtitle
export const AuthSubtitle = styled.p`
  color: #64748b;
  text-align: center;
  margin-bottom: 24px;
  font-size: 1rem;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 20px;
  }
`;

// Tab Container
export const TabContainer = styled.div`
  display: flex;
  margin-bottom: 32px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 4px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

export const TabButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
  color: #64748b;
  
  ${props => props.active && css`
    background: white;
    color: #1e293b;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  `}
  
  &:hover {
    color: #1e293b;
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 0.85rem;
  }
`;

// Form Group
export const FormGroup = styled.div`
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

// Label
export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 600;
  font-size: 0.95rem;
  
  ${props => props.required && css`
    &::after {
      content: ' *';
      color: #ef4444;
    }
  `}
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 6px;
  }
`;

// Input Base
const inputBase = css`
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8fafc;
  color: #1e293b;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #64748b;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.1);
    background: white;
  }
  
  &::placeholder {
    color: #94a3b8;
  }
  
  &:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 14px;
    font-size: 16px; /* Prevent zoom on iOS */
  }
`;

// Regular Input
export const Input = styled.input`
  ${inputBase}
`;

// PIN Input
export const PinInput = styled.input`
  ${inputBase}
  text-align: center;
  letter-spacing: 8px;
  font-weight: 600;
  font-size: 1.5rem;
  
  &::placeholder {
    letter-spacing: 4px;
  }
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    letter-spacing: 6px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    letter-spacing: 4px;
  }
`;

// Button
export const Button = styled.button`
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
  font-family: inherit;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(71, 85, 105, 0.25);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  ${props => props.loading && css`
    position: relative;
    color: transparent;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 20px;
      height: 20px;
      border: 2px solid transparent;
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: translate(-50%, -50%) rotate(0deg); }
      100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
  `}
  
  @media (max-width: 768px) {
    padding: 14px;
    font-size: 1rem;
  }
`;

// Secondary Button
export const SecondaryButton = styled(Button)`
  background: transparent;
  color: #64748b;
  border: 2px solid #e2e8f0;
  
  &:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #475569;
  }
`;

// Error Message
export const ErrorMessage = styled.div`
  color: #ef4444;
  margin-top: 12px;
  text-align: center;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  animation: ${slideIn} 0.3s ease-out;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 10px;
  }
`;

// Success Message
export const SuccessMessage = styled.div`
  color: #059669;
  margin-top: 12px;
  text-align: center;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  animation: ${slideIn} 0.3s ease-out;
`;

// Helper Text
export const HelperText = styled.div`
  color: #64748b;
  font-size: 0.85rem;
  margin-top: 6px;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

// Link
export const AuthLink = styled.a`
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  
  &:hover {
    color: #475569;
    text-decoration: underline;
  }
`;

// Info Box
export const InfoBox = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: #f1f5f9;
  border-radius: 12px;
  border-left: 4px solid #64748b;
  
  @media (max-width: 768px) {
    margin-top: 20px;
    padding: 14px;
  }
`;

export const InfoTitle = styled.div`
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

export const InfoItem = styled.div`
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// Security Note
export const SecurityNote = styled.div`
  text-align: center;
  margin-top: 20px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  
  small {
    color: #64748b;
    font-size: 0.8rem;
    line-height: 1.4;
  }
  
  @media (max-width: 768px) {
    margin-top: 16px;
    padding: 10px;
  }
`;

// Loading Overlay
export const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f4f6;
    border-top: 4px solid #64748b;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Responsive Grid
export const ResponsiveGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

// Form Actions
export const FormActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
  
  @media (max-width: 768px) {
    margin-top: 20px;
    gap: 10px;
  }
`;

// Tab Content
export const TabContent = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
  animation: ${props => props.active ? fadeIn : 'none'} 0.3s ease-out;
`;

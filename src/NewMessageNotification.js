import React, { useEffect } from 'react';
import styled from 'styled-components';

const NotificationContainer = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 2000;
  min-width: 340px;
  max-width: 400px;
`;

const NotificationItem = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  margin-bottom: 16px;
  padding: 16px 20px 12px 20px;
  cursor: pointer;
  border-left: 4px solid #3b82f6;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 8px 24px rgba(59,130,246,0.18);
    background: #f8fafc;
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const SenderName = styled.span`
  font-weight: 600;
  color: #1e293b;
  font-size: 1rem;
`;

const Timestamp = styled.span`
  color: #64748b;
  font-size: 0.85rem;
`;

const MessageContent = styled.div`
  color: #334155;
  font-size: 0.95rem;
  margin-top: 2px;
  word-break: break-word;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: 8px;
  &:hover { color: #ef4444; }
`;

const popupStyle = {
  position: 'fixed',
  bottom: 32,
  right: 32,
  minWidth: 340,
  maxWidth: 420,
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
  zIndex: 2000,
  padding: 0,
  overflow: 'hidden',
  animation: 'slideInNotif 0.3s',
  borderLeft: '8px solid #3b82f6'
};

const headerStyle = {
  background: '#f1f5f9',
  padding: '16px 20px',
  fontWeight: 700,
  fontSize: '1.1rem',
  color: '#1e293b',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const bodyStyle = {
  padding: '18px 20px',
  fontSize: '1rem',
  color: '#334155'
};

const timeStyle = {
  fontSize: '0.85rem',
  color: '#64748b',
  marginTop: 8
};

export default function NewMessageNotification({ alert, onClose, onReply }) {
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(onClose, 7000); // แสดง 7 วินาที
    return () => clearTimeout(timer);
  }, [alert, onClose]);

  if (!alert) return null;
  return (
    <div style={popupStyle}>
      <div style={headerStyle}>
        <span>📩 ข้อความใหม่จาก {alert.sender_name || alert.user}</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', fontSize: 22, color: '#64748b', cursor: 'pointer'
        }}>&times;</button>
      </div>
      <div style={bodyStyle}>
        <div style={{ marginBottom: 8 }}>{alert.message}</div>
        <div style={timeStyle}>{new Date(alert.timestamp).toLocaleString('th-TH')}</div>
        <button
          onClick={() => { onReply(alert.user_id); onClose(); }}
          style={{
            marginTop: 12,
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 18px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >ไปที่แชท</button>
      </div>
      <style>
        {`@keyframes slideInNotif {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }`}
      </style>
    </div>
  );
} 
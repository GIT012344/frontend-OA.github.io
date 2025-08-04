import React, { useEffect } from 'react';
import styled from 'styled-components';

const PopupContainer = styled.div`
  z-index: 3000;
  min-width: 340px;
  max-width: 420px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  border-left: 8px solid #3b82f6;
  overflow: hidden;
  animation: slideInNotif 0.3s;
  @media (max-width: 600px) {
    min-width: unset;
    max-width: 98vw;
  }
`;
const PopupHeader = styled.div`
  background: #f1f5f9;
  padding: 18px 24px 10px 24px;
  font-weight: 700;
  font-size: 1.1rem;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const PopupBody = styled.div`
  padding: 18px 24px 18px 24px;
  font-size: 1.05rem;
  color: #334155;
`;
const PopupTime = styled.div`
  font-size: 0.9rem;
  color: #64748b;
  margin-top: 8px;
`;
const PopupButton = styled.button`
  margin-top: 16px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(59,130,246,0.10);
  transition: background 0.2s;
  &:hover { background: #2563eb; }
`;
const PopupClose = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.5rem;
  cursor: pointer;
  margin-left: 8px;
  &:hover { color: #ef4444; }
`;

export default function NewMessageNotification({ alert, onClose, onReply }) {
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(onClose, 7000); // แสดง 7 วินาที
    return () => clearTimeout(timer);
  }, [alert, onClose]);
  if (!alert) return null;
  return (
    <PopupContainer style={{
      position: 'fixed',
      right: window.innerWidth <= 600 ? '8px' : '32px',
      left: 'auto',
      bottom: window.innerWidth <= 600 ? '8px' : '32px',
      zIndex: 9999,
      maxWidth: window.innerWidth <= 600 ? '98vw' : '420px',
      minWidth: window.innerWidth <= 600 ? 'unset' : '340px'
    }}>
      <PopupHeader>
        <span>📩 ข้อความใหม่จาก {alert.sender_name || alert.user}</span>
        <PopupClose onClick={onClose} title="ปิดแจ้งเตือน">&times;</PopupClose>
      </PopupHeader>
      <PopupBody>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>{alert.message}</div>
        <PopupTime>{new Date(alert.timestamp).toLocaleString('th-TH', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })}</PopupTime>
        <PopupButton onClick={() => { onReply(alert.user_id); onClose(); }}>
          ไปที่แชท
        </PopupButton>
      </PopupBody>
      <style>{`@keyframes slideInNotif { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </PopupContainer>
  );
} 
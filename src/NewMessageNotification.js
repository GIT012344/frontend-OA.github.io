import React from 'react';
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

export default function NewMessageNotification({ messages = [], handleNotificationClick, handleClose }) {
  if (!messages || messages.length === 0) return null;
  return (
    <NotificationContainer>
      {messages.map(msg => (
        <NotificationItem 
          key={msg.id} 
          onClick={() => handleNotificationClick && handleNotificationClick(msg)}
        >
          <NotificationHeader>
            <SenderName>
              {msg.sender_name || 'ผู้ใช้ไม่ระบุชื่อ'}
              <CloseButton onClick={e => { e.stopPropagation(); handleClose && handleClose(msg.id, e); }}>
                &times;
              </CloseButton>
            </SenderName>
            <Timestamp>
              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
            </Timestamp>
          </NotificationHeader>
          <MessageContent>
            {msg.message && msg.message.length > 100 
              ? `${msg.message.substring(0, 100)}...` 
              : msg.message}
          </MessageContent>
        </NotificationItem>
      ))}
    </NotificationContainer>
  );
} 
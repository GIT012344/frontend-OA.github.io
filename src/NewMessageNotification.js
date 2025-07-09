import { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NotificationContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NotificationItem = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  width: 320px;
  border-left: 4px solid #3b82f6;
  animation: slideIn 0.3s ease-out;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const SenderName = styled.div`
  font-weight: 600;
  color: #1e293b;
`;

const Timestamp = styled.div`
  font-size: 0.75rem;
  color: #64748b;
`;

const MessageContent = styled.div`
  color: #334155;
  white-space: pre-wrap;
  word-break: break-word;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  margin-left: 8px;
`;

export default function NewMessageNotification() {
  const [messages, setMessages] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();

  const checkNewMessages = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      const response = await axios.get('/api/check-new-messages');
      if (response.data.success && response.data.new_messages.length > 0) {
        setMessages(prev => [
          ...response.data.new_messages,
          ...prev.filter(m => 
            !response.data.new_messages.some(nm => nm.id === m.id)
          )
        ]);
        
        // แสดงการแจ้งเตือนแต่ละข้อความเป็นเวลา 8 วินาที
        response.data.new_messages.forEach(msg => {
          setTimeout(() => {
            setMessages(prev => prev.filter(m => m.id !== msg.id));
          }, 8000);
        });
      }
    } catch (error) {
      console.error('Error checking new messages:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // ตรวจสอบข้อความใหม่ทุกๆ 5 วินาที
    const interval = setInterval(checkNewMessages, 5000);
    checkNewMessages(); // ตรวจสอบทันทีเมื่อ component โหลด
    
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (message) => {
    // นำทางไปยังหน้าสนทนากับผู้ใช้ที่ส่งข้อความมา
    navigate('/chat');
    setMessages(prev => prev.filter(m => m.id !== message.id));
    
    // ทำเครื่องหมายว่าอ่านแล้ว
    axios.post('/api/mark-message-read', { message_id: message.id })
      .catch(error => console.error('Error marking message as read:', error));
  };

  const handleClose = (messageId, e) => {
    e.stopPropagation();
    setMessages(prev => prev.filter(m => m.id !== messageId));
    
    // ทำเครื่องหมายว่าอ่านแล้ว
    axios.post('/api/mark-message-read', { message_id: messageId })
      .catch(error => console.error('Error marking message as read:', error));
  };

  if (messages.length === 0) return null;

  return (
    <NotificationContainer>
      {messages.map(msg => (
        <NotificationItem 
          key={msg.id} 
          onClick={() => handleNotificationClick(msg)}
        >
          <NotificationHeader>
            <SenderName>
              {msg.sender_name || 'ผู้ใช้ไม่ระบุชื่อ'}
              <CloseButton onClick={(e) => handleClose(msg.id, e)}>
                &times;
              </CloseButton>
            </SenderName>
            <Timestamp>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </Timestamp>
          </NotificationHeader>
          <MessageContent>
            {msg.message.length > 100 
              ? `${msg.message.substring(0, 100)}...` 
              : msg.message}
          </MessageContent>
        </NotificationItem>
      ))}
    </NotificationContainer>
  );
} 
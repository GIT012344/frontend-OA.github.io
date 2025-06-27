import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ChatComponent = ({ ticketId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // ดึงข้อความเมื่อโหลด component หรือเมื่อ ticketId เปลี่ยน
  useEffect(() => {
    if (ticketId) {
      fetchMessages();
    }
    // eslint-disable-next-line
  }, [ticketId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://backend-oa-pqy2.onrender.com/api/messages?ticket_id=${ticketId}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      await axios.post('https://your-backend-url/api/messages', {
        ticket_id: ticketId,
        admin_id: user?.id,
        sender_name: user?.name,
        message: newMessage,
        is_admin_message: true
      });

      // เคลียร์ช่องข้อความและดึงข้อมูลใหม่
      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-list">
        {loading ? (
          <p>Loading messages...</p>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`message ${msg.is_admin_message ? 'admin-message' : 'user-message'}`}
            >
              <strong>{msg.sender_name}:</strong> {msg.message}
              <small>{new Date(msg.timestamp).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>

      <div className="message-input">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatComponent; 
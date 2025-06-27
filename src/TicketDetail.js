import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatComponent from './ChatComponent';

const TicketDetail = ({ ticketId }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://your-backend-url/api/ticket/${ticketId}`);
        setTicket(response.data);
      } catch (error) {
        console.error('Error fetching ticket:', error);
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  if (loading) return <p>Loading ticket...</p>;
  if (!ticket) return <p>Ticket not found</p>;

  return (
    <div className="ticket-detail">
      <h2>Ticket #{ticket.ticket_id}</h2>
      <p>Status: {ticket.status}</p>
      <p>Name: {ticket.name}</p>
      <p>Department: {ticket.department}</p>
      {/* ส่วนแสดงประวัติการสนทนา */}
      <div className="chat-section">
        <h3>Conversation History</h3>
        <ChatComponent ticketId={ticketId} />
      </div>
    </div>
  );
};

export default TicketDetail; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TicketDetail = ({ ticketId }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:5004';
        const response = await axios.get(`${API_BASE_URL}/api/ticket/${ticketId}`);
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
      {/* Chat functionality is now available in the main dashboard */}
      <div className="chat-section">
        <h3>Ticket Information</h3>
        <p>Use the Chat tab in the main dashboard to communicate with users.</p>
      </div>
    </div>
  );
};

export default TicketDetail; 
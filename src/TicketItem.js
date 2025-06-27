import React from 'react';
import { Link } from 'react-router-dom';

const TicketItem = ({ ticket }) => {
  // ตรวจสอบว่ามีข้อความใหม่ที่ยังไม่อ่าน
  const hasUnreadMessages = ticket.unread_message_count > 0;

  return (
    <div className={`ticket-item ${hasUnreadMessages ? 'unread' : ''}`}>
      <Link to={`/tickets/${ticket.ticket_id}`}>
        <h3>#{ticket.ticket_id} - {ticket.name}</h3>
        <p>Status: {ticket.status}</p>
        <p>Department: {ticket.department}</p>
        {hasUnreadMessages && (
          <span className="unread-badge">New messages</span>
        )}
      </Link>
    </div>
  );
};

export default TicketItem; 
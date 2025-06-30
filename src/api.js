import axios from 'axios';

const API_BASE_URL = 'https://backend-oa-pqy2.onrender.com';

export const fetchMessages = async (ticketId) => {
  const response = await axios.get(`${API_BASE_URL}/api/messages`, {
    params: { ticket_id: ticketId }
  });
  return response.data;
};

export const sendMessage = async (messageData) => {
  const response = await axios.post(`${API_BASE_URL}/api/messages`, messageData);
  return response.data;
};

export const fetchTicket = async (ticketId) => {
  const response = await axios.get(`${API_BASE_URL}/api/ticket/${ticketId}`);
  return response.data;
};

export const updateTicketStatus = async (ticketId, newStatus) => {
  const response = await axios.post(`${API_BASE_URL}/update-status`, {
    ticket_id: ticketId,
    status: newStatus
  });
  return response.data;
}; 
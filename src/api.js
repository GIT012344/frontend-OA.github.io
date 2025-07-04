import axios from 'axios';

const API_BASE_URL = 'https://backend-oa-pqy2.onrender.com';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Health check function
export const checkBackendHealth = async () => {
  try {
    const response = await apiClient.get('/api/health');
    return response.status === 200;
  } catch (error) {
    console.warn('⚠️ Backend health check failed:', error.message);
    return false;
  }
};

// Test connection function
export const testConnection = async () => {
  try {
    const response = await apiClient.get('/api/data', { timeout: 5000 });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      status: error.response?.status,
      details: error.response?.data
    };
  }
};

export default apiClient;

export const fetchMessages = async (userId) => {
  const response = await apiClient.get('/api/messages', {
    params: { user_id: userId }
  });
  return response.data;
};

export const sendMessage = async (messageData) => {
  const response = await apiClient.post('/api/messages', messageData);
  return response.data;
};

export const fetchTicket = async (ticketId) => {
  const response = await apiClient.get(`/api/ticket/${ticketId}`);
  return response.data;
};

export const updateTicketStatus = async (ticketId, newStatus) => {
  const response = await apiClient.post('/update-status', {
    ticket_id: ticketId,
    status: newStatus
  });
  return response.data;
};

// ------------------------------------------------------------
// 🆕 Status change log endpoints
// ------------------------------------------------------------

// Log a status change (POST /api/log-status-change)
export const logStatusChange = async ({ ticket_id, old_status, new_status, changed_by, change_timestamp }) => {
  const response = await apiClient.post('/api/log-status-change', {
    ticket_id,
    old_status,
    new_status,
    changed_by,
    change_timestamp,
  });
  return response.data;
};

// Fetch status change history for a given ticket (GET /api/log-status-change)
export const fetchStatusChangeHistory = async (ticketId) => {
  const response = await apiClient.get('/api/log-status-change', {
    params: { ticket_id: ticketId },
  });
  return response.data;
};
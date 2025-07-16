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
export const TYPE_GROUP_SUBGROUP = {
  Service: {
    Hardware: [
      "ลงทะเบียน USB", "ติดตั้งอุปกรณ์", "ทดสอบอุปกรณ์", "ตรวจสอบอุปกรณ์"
    ],
    Meeting: [
      "ติดตั้งอุปกรณ์ประชุม", "ขอ Link ประชุม / Zoom", "เชื่อมต่อ TV", "ขอยืมอุปกรณ์"
    ],
    Service: [
      "ขอยืมอุปกรณ์", "เชื่อมต่ออุปกรณ์", "ย้ายจุดติดตั้ง"
    ],
    Software: [
      "ติดตั้งโปรแกรม", "ตั้งค่าโปรแกรม", "ตรวจสอบโปรแกรม", "เปิดสิทธิ์การใช้งาน"
    ],
    "บริการอื่นๆ": []
  },
  Helpdesk: {
    "คอมพิวเตอร์": ["PC", "Notebook", "MAC"],
    "ปริ้นเตอร์": ["เครื่องพิมพ์", "Barcode Printer", "Scanner"],
    "อุปกรณ์ต่อพ่วง": ["เมาส์", "คีย์บอร์ด", "UPS", "จอคอมพิวเตอร์", "Projector"],
    "โปรแกรม": ["Windows", "User Login", "E-Mail / Outlook", "ERP/CRM/LMS", "MyHR", "ระบบผิดพลาด", "อื่นๆ"],
    "เน็ตเวิร์ค": ["การเชื่อมต่อ", "ไม่มีสัญญาณ", "WIFI"],
    "ข้อมูล": ["ข้อมูลหาย", "File Sharing/Map Drive"],
    "ปัญหาอื่นๆ": []
  }
};
// Health check function

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

export const updateTicketStatus = async (ticketId, newStatus, note = "", remarks = "") => {
  const response = await apiClient.post('/update-status-with-note', {
    ticket_id: ticketId,
    status: newStatus,
    note,
    remarks
  });
  return response.data;
};

// ------------------------------------------------------------
// 🆕 Status change log endpoints
// ------------------------------------------------------------

// Log a status change (POST /api/log-status-change)
export const logStatusChange = async ({ ticket_id, old_status, new_status, changed_by, change_timestamp, note = "", remarks = "" }) => {
  const response = await apiClient.post('/api/log-status-change', {
    ticket_id,
    old_status,
    new_status,
    changed_by,
    change_timestamp,
    note,
    remarks
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
import AuthManager from './auth';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://backend-oa-pqy2.onrender.com';

// API Utilities
class ApiUtils {
  static async handleApiResponse(response) {
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data };
    } else {
      // Handle different error status codes
      switch (response.status) {
        case 401:
          // Unauthorized - token expired or invalid
          AuthManager.clearAuth();
          window.location.href = '/login';
          break;
          
        case 403:
          // Forbidden - might need PIN verification
          if (data.error === 'PIN verification required') {
            localStorage.setItem('requires_pin', 'true');
            window.location.href = '/pin-verification';
          }
          break;
          
        case 422:
          // Unprocessable Entity - validation error
          console.warn('Validation error (422):', data.error);
          break;
          
        case 423:
          // Account locked
          alert('บัญชีถูกล็อค กรุณาลองใหม่ในภายหลัง');
          break;
          
        default:
          // Other error status codes
          console.warn('Unhandled API error status:', response.status);
          break;
      }
      
      return { success: false, error: data.error };
    }
  }
  
  static showErrorMessage(error) {
    // Show user-friendly error messages
    const errorMessages = {
      'Username already exists': 'ชื่อผู้ใช้นี้มีอยู่แล้ว',
      'Email already exists': 'อีเมล์นี้มีอยู่แล้ว',
      'PIN already exists': 'PIN นี้มีอยู่แล้ว',
      'Invalid username or password': 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      'Invalid PIN': 'PIN ไม่ถูกต้อง',
      'Account is locked': 'บัญชีถูกล็อค',
      'PIN verification required': 'กรุณายืนยัน PIN'
    };
    
    return errorMessages[error] || error;
  }
}

// Authentication API
export const authAPI = {
  // Register new user
  async register(userData) {
    try {
      const requestData = {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        name: userData.displayName, // Backend expects 'name' not 'displayName'
        pin: '000000', // Fixed PIN for everyone
        role: 'user'
      };
      
      console.log('API Register request:', requestData);
      
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('API Register response status:', response.status);
      
      // Handle response manually to get better error details
      const responseText = await response.text();
      console.log('API Register response text:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        return { 
          success: false, 
          error: `เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์ (${response.status})` 
        };
      }
      
      if (response.ok) {
        return { success: true, user: result.user || result.data?.user };
      } else {
        const errorMessage = result.error || result.message || `HTTP ${response.status}`;
        return { success: false, error: ApiUtils.showErrorMessage(errorMessage) };
      }
    } catch (error) {
      console.error('Register API error:', error);
      return { 
        success: false, 
        error: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${error.message}` 
      };
    }
  },

  // Login with username/password
  async login(username, password) {
    try {
      const requestData = {
        username: username,
        password: password
      };
      
      console.log('API Login request:', requestData);
      
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('API Login response status:', response.status);
      
      // Handle response manually to get better error details
      const responseText = await response.text();
      console.log('API Login response text:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse login response as JSON:', e);
        return { 
          success: false, 
          error: `เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์ (${response.status})` 
        };
      }
      
      if (response.ok) {
        AuthManager.setAuthData(
          result.access_token || result.data?.access_token,
          result.user || result.data?.user,
          true // Always require PIN verification
        );
        
        return { 
          success: true, 
          token: result.access_token || result.data?.access_token,
          user: result.user || result.data?.user,
          requiresPin: true,
          message: result.message || result.data?.message
        };
      } else {
        let errorMessage = result.error || result.message || `HTTP ${response.status}`;
        
        // Handle specific backend errors
        if (result.details && result.details.includes('datetime')) {
          errorMessage = 'เกิดข้อผิดพลาดในระบบ backend (datetime issue) กรุณาติดต่อผู้ดูแลระบบ';
        } else if (response.status === 500) {
          errorMessage = 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ';
        }
        
        return { success: false, error: ApiUtils.showErrorMessage(errorMessage) };
      }
    } catch (error) {
      console.error('Login API error:', error);
      return { 
        success: false, 
        error: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${error.message}` 
      };
    }
  },

  // Verify PIN (fixed PIN: 000000)
  async verifyPin(pinData) {
    try {
      const token = localStorage.getItem('access_token');
      
      // ✅ ส่งแค่ PIN เท่านั้น ตามคำแนะนำของ backend
      const requestData = {
        pin: pinData.pin || '000000' // Always use fixed PIN
      };
      
      console.log('API PIN Verification request:', requestData);
      console.log('Token present:', token ? 'Yes' : 'No');
      
      const response = await fetch(`${API_BASE_URL}/api/verify-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('API PIN Verification response status:', response.status);
      
      // Handle response manually to get better error details
      const responseText = await response.text();
      console.log('API PIN Verification response text:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse PIN verification response as JSON:', e);
        return { 
          success: false, 
          error: `เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์ (${response.status})` 
        };
      }
      
      if (response.ok) {
        // ✅ ใช้ markPinVerified ตามคำแนะนำของ backend
        AuthManager.markPinVerified();
        
        return { 
          success: true, 
          message: result.message || result.data?.message || 'PIN verification successful',
          user: result.user || result.data?.user,
          session: result.session || result.data?.session
        };
      } else {
        let errorMessage = result.error || result.message || `HTTP ${response.status}`;
        
        // Handle specific PIN verification errors
        if (response.status === 422) {
          errorMessage = 'ข้อมูล PIN ไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง';
        }
        
        return { success: false, error: ApiUtils.showErrorMessage(errorMessage) };
      }
    } catch (error) {
      console.error('PIN Verification API error:', error);
      return { 
        success: false, 
        error: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${error.message}` 
      };
    }
  },

  // Logout
  async logout() {
    const token = localStorage.getItem('access_token');
    
    try {
      console.log('API Logout request with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_BASE_URL}/api/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
        // No body needed for logout
      });
      
      console.log('API Logout response status:', response.status);
      
      // Handle response manually
      const responseText = await response.text();
      console.log('API Logout response text:', responseText);
      
      // ✅ Clear auth data และ PIN verification regardless of API response
      AuthManager.clearAuth();
      AuthManager.clearPinVerification();
      
      if (response.ok) {
        let result;
        try {
          result = JSON.parse(responseText);
          return { success: true, message: result.message || 'ออกจากระบบสำเร็จ' };
        } catch (e) {
          return { success: true, message: 'ออกจากระบบสำเร็จ' };
        }
      } else {
        // Even if logout fails, we still clear local auth data
        console.warn('Logout API failed but clearing local auth data');
        return { success: true, message: 'ออกจากระบบสำเร็จ' };
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Clear auth data even if logout API fails
      AuthManager.clearAuth();
      return { success: true, message: 'ออกจากระบบสำเร็จ' };
    }
  },

  // Get activity logs (admin only)
  async getActivityLogs(filters = {}) {
    const token = localStorage.getItem('access_token');
    
    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('start_date', filters.startDate);
    if (filters.endDate) queryParams.append('end_date', filters.endDate);
    if (filters.username) queryParams.append('username', filters.username);
    if (filters.action) queryParams.append('action', filters.action);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const response = await fetch(`${API_BASE_URL}/api/user/activity-logs?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await ApiUtils.handleApiResponse(response);
    
    if (result.success) {
      return { 
        success: true, 
        logs: result.data.logs,
        pagination: result.data.pagination
      };
    } else {
      return { success: false, error: ApiUtils.showErrorMessage(result.error) };
    }
  },

  // Create ticket (requires PIN verification)
  async createTicket(ticketData) {
    const token = localStorage.getItem('access_token');
    const pinVerified = localStorage.getItem('pin_verified');
    
    if (!pinVerified) {
      return { 
        success: false, 
        error: 'กรุณายืนยัน PIN ก่อนสร้าง ticket',
        requiresPinVerification: true
      };
    }
    
    const response = await fetch(`${API_BASE_URL}/create-ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(ticketData)
    });
    
    const result = await ApiUtils.handleApiResponse(response);
    
    if (result.success) {
      return { 
        success: true, 
        ticket: result.data.ticket,
        message: result.data.message
      };
    } else {
      return { success: false, error: ApiUtils.showErrorMessage(result.error) };
    }
  }
};

// Activity API (alias for authAPI for backward compatibility)
export const activityAPI = authAPI;

export default ApiUtils;

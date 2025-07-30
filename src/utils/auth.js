// Enhanced Authentication Manager
class AuthManager {
  static isLoggedIn() {
    return !!localStorage.getItem('access_token');
  }
  
  static isPinVerified() {
    return localStorage.getItem('pin_verified') === 'true';
  }
  
  static requiresPinVerification() {
    return localStorage.getItem('requires_pin') === 'true';
  }
  
  static getCurrentUser() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
  
  static getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
  
  static clearAuth() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('pin_verified');
    localStorage.removeItem('session_data');
    localStorage.removeItem('requires_pin');
  }
  
  static redirectBasedOnState() {
    if (!this.isLoggedIn()) {
      window.location.href = '/login';
    } else if (this.requiresPinVerification() && !this.isPinVerified()) {
      window.location.href = '/pin-verification';
    } else {
      window.location.href = '/dashboard';
    }
  }
  
  static setAuthData(token, user, requiresPin = true) {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    localStorage.setItem('requires_pin', requiresPin.toString());
  }
  
  static setPinVerified(session = null) {
    localStorage.setItem('pin_verified', 'true');
    localStorage.setItem('requires_pin', 'false');
    if (session) {
      localStorage.setItem('session_data', JSON.stringify(session));
    }
  }
  
  // เพิ่ม markPinVerified function ตามคำแนะนำของ backend
  static markPinVerified() {
    localStorage.setItem('pin_verified', 'true');
    localStorage.setItem('requires_pin', 'false');
  }
  
  static clearPinVerification() {
    localStorage.removeItem('pin_verified');
    localStorage.setItem('requires_pin', 'true');
  }
}

export default AuthManager;

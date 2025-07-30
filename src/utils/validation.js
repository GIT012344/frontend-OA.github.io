// Form Validation Utilities
class FormValidator {
  static validateRegisterForm(formData) {
    const errors = [];
    
    // Username validation
    if (!formData.username || formData.username.length < 3 || formData.username.length > 50) {
      errors.push('ชื่อผู้ใช้ต้องมี 3-50 ตัวอักษร');
    }
    
    // Password validation
    if (!formData.password || formData.password.length < 6) {
      errors.push('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.push('รูปแบบอีเมล์ไม่ถูกต้อง');
    }
    
    // Display name validation
    if (!formData.displayName || formData.displayName.trim().length === 0) {
      errors.push('กรุณาใส่ชื่อ-นามสกุล');
    }
    
    return errors;
  }
  
  static validateLoginForm(formData, isCredentialsLogin) {
    const errors = [];
    
    if (isCredentialsLogin) {
      if (!formData.username) errors.push('กรุณาใส่ชื่อผู้ใช้');
      if (!formData.password) errors.push('กรุณาใส่รหัสผ่าน');
    } else {
      if (!formData.pin) errors.push('กรุณาใส่ PIN');
    }
    
    return errors;
  }
  
  static validatePinForm(pin) {
    const errors = [];
    
    if (!pin || pin.length < 4) {
      errors.push('PIN ต้องมีอย่างน้อย 4 ตัวอักษร');
    }
    
    return errors;
  }
  
  // Real-time validation helpers
  static isValidUsername(username) {
    return username && username.length >= 3 && username.length <= 50;
  }
  
  static isValidPassword(password) {
    return password && password.length >= 6;
  }
  
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email && emailRegex.test(email);
  }
  
  static isValidPin(pin) {
    return pin && pin.length >= 4 && pin.length <= 10;
  }
  
  static isValidName(name) {
    return name && name.trim().length > 0;
  }
}

export default FormValidator;

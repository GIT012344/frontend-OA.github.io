import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from './utils/api';
import AuthManager from './utils/auth';

const AuthContext = createContext();

// Enhanced AuthProvider with new authentication flow
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [requiresPinVerification, setRequiresPinVerification] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    try {
      const loggedIn = AuthManager.isLoggedIn();
      const pinVerified = AuthManager.isPinVerified();
      const needsPinVerification = AuthManager.requiresPinVerification();
      const userData = AuthManager.getCurrentUser();

      setIsLoggedIn(loggedIn);
      setIsPinVerified(pinVerified);
      setRequiresPinVerification(needsPinVerification);
      setUser(userData);

      console.log('Auth state initialized:', {
        loggedIn,
        pinVerified,
        needsPinVerification,
        user: userData
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Clear any corrupted auth data
      AuthManager.clearAuth();
      setIsLoggedIn(false);
      setIsPinVerified(false);
      setRequiresPinVerification(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login with username/password
  const login = async (username, password) => {
    try {
      const result = await authAPI.login(username, password);
      
      if (result.success) {
        setIsLoggedIn(true);
        setUser(result.user);
        setRequiresPinVerification(true); // Always require PIN verification
        setIsPinVerified(false);
        
        return {
          success: true,
          requiresPin: true,
          user: result.user
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
      };
    }
  };

  // Verify PIN
  const verifyPIN = async (pin) => {
    try {
      const result = await authAPI.verifyPin({ pin });
      
      if (result.success) {
        setIsPinVerified(true);
        setRequiresPinVerification(false);
        
        // Update user data if provided
        if (result.user) {
          setUser(result.user);
        }
        
        return {
          success: true,
          user: result.user
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการยืนยัน PIN'
      };
    }
  };

  // Verify PIN
  const verifyPin = async (pin) => {
    try {
      const result = await authAPI.verifyPin({ pin });
      
      if (result.success) {
        // Mark PIN as verified in AuthManager
        AuthManager.markPinVerified();
        
        // Update AuthContext state
        setIsPinVerified(true);
        setRequiresPinVerification(false);
        
        return {
          success: true
        };
      } else {
        return {
          success: false,
          error: result.error || 'PIN ไม่ถูกต้อง'
        };
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      return {
        success: false,
        error: 'เกิดข้อผิดพลาดในการยืนยัน PIN'
      };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    } finally {
      // Clear all auth state
      AuthManager.clearAuth();
      setIsLoggedIn(false);
      setIsPinVerified(false);
      setRequiresPinVerification(false);
      setUser(null);
    }
  };



  // Check if user is fully authenticated (logged in + PIN verified)
  const isFullyAuthenticated = () => {
    return isLoggedIn && (!requiresPinVerification || isPinVerified);
  };

  // Get authentication headers for API calls
  const getAuthHeaders = () => {
    return AuthManager.getAuthHeaders();
  };

  const contextValue = {
    // State
    user,
    loading,
    isLoggedIn,
    isPinVerified,
    requiresPinVerification,
    
    // Methods
    login,
    verifyPin,
    verifyPIN,
    logout,
    
    // Utilities
    isFullyAuthenticated,
    getAuthHeaders,
    initializeAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
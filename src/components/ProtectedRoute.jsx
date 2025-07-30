import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import AuthManager from '../utils/auth';
import {
  LoadingOverlay
} from './styled/AuthStyles';

const ProtectedRoute = ({ children, requirePinVerification = true, adminOnly = false }) => {
  const { loading, isLoggedIn, isPinVerified, requiresPinVerification, user } = useAuth();
  const location = useLocation();

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <LoadingOverlay>
        <div className="spinner"></div>
      </LoadingOverlay>
    );
  }

  // Check if user is logged in
  if (!isLoggedIn || !AuthManager.isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if PIN verification is required
  if (requirePinVerification && requiresPinVerification && !isPinVerified) {
    return <Navigate to="/pin-verification" state={{ from: location }} replace />;
  }

  // Check admin access if required
  if (adminOnly && (!user || user.role !== 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  // All checks passed, render the protected component
  return children;
};

export default ProtectedRoute;

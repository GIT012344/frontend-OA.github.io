import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../AuthContext';

const PermissionContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  const { user } = useAuth();
  
  const userRole = user?.role || 'user';
  
  const permissions = useMemo(() => {
    const isAdmin = userRole === 'admin';
    const isModerator = userRole === 'moderator' || isAdmin;
    const isUser = userRole === 'user' || isModerator;
    
    return {
      // Basic permissions
      canViewDashboard: isUser,
      canViewTickets: isUser,
      canCreateTickets: isUser,
      canEditOwnTickets: isUser,
      canViewChat: isUser,
      
      // Moderator permissions
      canViewActivityLogs: isModerator,
      canEditAllTickets: isModerator,
      canViewStatusLogs: isModerator,
      canManageTicketStatus: isModerator,
      
      // Admin permissions
      canManageUsers: isAdmin,
      canManageEmailTemplates: isAdmin,
      canManageAlertSettings: isAdmin,
      canManageTypeGroups: isAdmin,
      canViewSystemSettings: isAdmin,
      canDeleteTickets: isAdmin,
      
      // Email Alert System permissions
      canViewEmailAlerts: isUser,
      canCreateEmailTemplates: isAdmin,
      canEditEmailTemplates: isAdmin,
      canDeleteEmailTemplates: isAdmin,
      canConfigureAlerts: isAdmin,
      canTestAlerts: isAdmin,
      
      // User Management permissions
      canCreateUsers: isAdmin,
      canEditUsers: isAdmin,
      canDeleteUsers: isAdmin,
      canManageUserPermissions: isAdmin,
      canViewUserList: isAdmin,
      
      // Role information
      userRole,
      isAdmin,
      isModerator,
      isUser
    };
  }, [userRole]);
  
  const hasPermission = (permission) => {
    return permissions[permission] || false;
  };
  
  const hasAnyPermission = (permissionList) => {
    return permissionList.some(permission => hasPermission(permission));
  };
  
  const hasAllPermissions = (permissionList) => {
    return permissionList.every(permission => hasPermission(permission));
  };
  
  const canAccessRoute = (route) => {
    const routePermissions = {
      '/dashboard': 'canViewDashboard',
      '/tickets': 'canViewTickets',
      '/chat': 'canViewChat',
      '/activity-logs': 'canViewActivityLogs',
      '/email-alerts': 'canViewEmailAlerts',
      '/email-templates': 'canManageEmailTemplates',
      '/alert-settings': 'canManageAlertSettings',
      '/user-management': 'canManageUsers',
      '/admin-type-group': 'canManageTypeGroups',
      '/status-logs': 'canViewStatusLogs'
    };
    
    const requiredPermission = routePermissions[route];
    return requiredPermission ? hasPermission(requiredPermission) : true;
  };
  
  const getRoleDisplayName = () => {
    const roleNames = {
      'admin': 'ผู้ดูแลระบบ',
      'moderator': 'ผู้ควบคุม',
      'user': 'ผู้ใช้งาน'
    };
    return roleNames[userRole] || userRole;
  };
  
  const value = {
    ...permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    getRoleDisplayName
  };
  
  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionProvider;

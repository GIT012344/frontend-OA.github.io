import React from 'react';
import { usePermissions } from '../contexts/PermissionContext';

/**
 * PermissionGuard - Component to conditionally render children based on permissions
 * 
 * Usage examples:
 * <PermissionGuard permission="canManageUsers">
 *   <AdminButton />
 * </PermissionGuard>
 * 
 * <PermissionGuard permissions={['canEditTickets', 'canDeleteTickets']} requireAll={false}>
 *   <EditDeleteButtons />
 * </PermissionGuard>
 * 
 * <PermissionGuard role="admin">
 *   <AdminPanel />
 * </PermissionGuard>
 */
const PermissionGuard = ({ 
  children, 
  permission, 
  permissions = [], 
  requireAll = true,
  role,
  roles = [],
  fallback = null,
  inverse = false 
}) => {
  const permissionContext = usePermissions();
  
  let hasAccess = false;
  
  // Check single permission
  if (permission) {
    hasAccess = permissionContext.hasPermission(permission);
  }
  
  // Check multiple permissions
  else if (permissions.length > 0) {
    hasAccess = requireAll 
      ? permissionContext.hasAllPermissions(permissions)
      : permissionContext.hasAnyPermission(permissions);
  }
  
  // Check single role
  else if (role) {
    hasAccess = permissionContext.userRole === role;
  }
  
  // Check multiple roles
  else if (roles.length > 0) {
    hasAccess = roles.includes(permissionContext.userRole);
  }
  
  // Default to true if no restrictions specified
  else {
    hasAccess = true;
  }
  
  // Inverse the logic if needed
  if (inverse) {
    hasAccess = !hasAccess;
  }
  
  return hasAccess ? children : fallback;
};

/**
 * AdminOnly - Shorthand for admin-only content
 */
export const AdminOnly = ({ children, fallback = null }) => (
  <PermissionGuard role="admin" fallback={fallback}>
    {children}
  </PermissionGuard>
);

/**
 * ModeratorOnly - Shorthand for moderator+ content
 */
export const ModeratorOnly = ({ children, fallback = null }) => (
  <PermissionGuard roles={['moderator', 'admin']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

/**
 * UserOnly - Shorthand for regular user content (hide from admins/moderators)
 */
export const UserOnly = ({ children, fallback = null }) => (
  <PermissionGuard role="user" fallback={fallback}>
    {children}
  </PermissionGuard>
);

/**
 * ConditionalRender - More flexible conditional rendering with custom logic
 */
export const ConditionalRender = ({ condition, children, fallback = null }) => {
  const permissionContext = usePermissions();
  
  const shouldRender = typeof condition === 'function' 
    ? condition(permissionContext) 
    : condition;
    
  return shouldRender ? children : fallback;
};

/**
 * RoleBasedContent - Render different content based on user role
 */
export const RoleBasedContent = ({ 
  adminContent, 
  moderatorContent, 
  userContent, 
  defaultContent = null 
}) => {
  const { userRole } = usePermissions();
  
  switch (userRole) {
    case 'admin':
      return adminContent || defaultContent;
    case 'moderator':
      return moderatorContent || defaultContent;
    case 'user':
      return userContent || defaultContent;
    default:
      return defaultContent;
  }
};

export default PermissionGuard;

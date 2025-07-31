import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../contexts/PermissionContext';

const SidebarContainer = styled.div`
  width: 250px;
  background: #1f2937;
  color: white;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  overflow-y: auto;
  transition: transform 0.3s ease;
  
  @media (max-width: 768px) {
    transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  }
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #374151;
  text-align: center;
`;

const Logo = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #f9fafb;
`;

const MenuSection = styled.div`
  padding: 16px 0;
`;

const SectionTitle = styled.div`
  padding: 8px 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MenuItem = styled.div`
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.875rem;
  color: #d1d5db;
  transition: all 0.2s ease;
  
  &:hover {
    background: #374151;
    color: #f9fafb;
  }
  
  ${props => props.active && `
    background: #3b82f6;
    color: white;
    font-weight: 500;
  `}
`;

const MenuIcon = styled.span`
  font-size: 1rem;
  width: 20px;
  text-align: center;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => props.show ? 'block' : 'none'};
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const NavigationSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, isAdmin } = usePermissions();

  // Enhanced permission system
  
  const menuItems = [
    {
      section: 'หลัก',
      items: [
        { path: '/dashboard', label: 'แดชบอร์ด', icon: '📊', roles: ['user', 'moderator', 'admin'] },
        { path: '/tickets', label: 'รายการ Tickets', icon: '🎫', roles: ['user', 'moderator', 'admin'] },
        { path: '/chat', label: 'แชท', icon: '💬', roles: ['user', 'moderator', 'admin'] },
        { path: '/activity-logs', label: 'บันทึกกิจกรรม', icon: '📋', roles: ['moderator', 'admin'] }
      ]
    },
    {
      section: 'Email Alert System',
      adminOnly: false,
      items: [
        { path: '/email-alerts', label: 'ประวัติ Email Alerts', icon: '📧', roles: ['user', 'moderator', 'admin'] },
        { path: '/email-templates', label: 'จัดการ Templates', icon: '📝', roles: ['admin'] },
        { path: '/alert-settings', label: 'ตั้งค่าการแจ้งเตือน', icon: '⚙️', roles: ['admin'] }
      ]
    },
    {
      section: 'จัดการระบบ',
      adminOnly: true,
      items: [
        { path: '/user-management', label: 'จัดการผู้ใช้', icon: '👥', roles: ['admin'] },
        { path: '/admin-type-group', label: 'จัดการ Type/Group', icon: '🏷️', roles: ['admin'] },
        { path: '/status-logs', label: 'Status Logs', icon: '📈', roles: ['moderator', 'admin'] }
      ]
    }
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const canAccessItem = (item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  };

  const canAccessSection = (section) => {
    if (!section.adminOnly) return true;
    return isAdmin;
  };



  return (
    <>
      <Overlay show={isOpen} onClick={onClose} />
      <SidebarContainer isOpen={isOpen}>
        <SidebarHeader>
          <Logo>🎫 Ticket System</Logo>
        </SidebarHeader>

        {menuItems
          .filter(section => canAccessSection(section))
          .map((section, sectionIndex) => (
          <MenuSection key={sectionIndex}>
            <SectionTitle>{section.section}</SectionTitle>
            {section.items
              .filter(item => canAccessItem(item))
              .map((item, itemIndex) => (
                <MenuItem
                  key={itemIndex}
                  active={isActive(item.path)}
                  onClick={() => handleMenuClick(item.path)}
                >
                  <MenuIcon>{item.icon}</MenuIcon>
                  {item.label}
                </MenuItem>
              ))}
          </MenuSection>
        ))}

        <MenuSection style={{ borderTop: '1px solid #374151', marginTop: 'auto' }}>
          <MenuItem onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}>
            <MenuIcon>🚪</MenuIcon>
            ออกจากระบบ
          </MenuItem>
        </MenuSection>
      </SidebarContainer>
    </>
  );
};

export default NavigationSidebar;

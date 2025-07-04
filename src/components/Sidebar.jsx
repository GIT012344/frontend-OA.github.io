import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaHistory } from 'react-icons/fa';

const SidebarContainer = styled.div`
  width: ${props => props.$collapsed ? '80px' : '250px'};
  height: 100vh;
  background-color: #ffffff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  transition: width 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
`;

const Logo = styled.div`
  padding: 0 24px 24px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #4f46e5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Nav = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
`;

const SidebarLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #475569;
  text-decoration: none;
  border-radius: 8px;
  margin: 4px 0;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: rgba(99, 102, 241, 0.1);
    color: #4f46e5;
  }
  
  &.active {
    background: rgba(99, 102, 241, 0.1);
    color: #4f46e5;
    font-weight: 600;
  }
  
  svg {
    margin-right: 12px;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  padding: 12px;
  cursor: pointer;
  color: #64748b;
  align-self: flex-start;
  margin-left: auto;
  margin-right: 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(99, 102, 241, 0.1);
    color: #4f46e5;
  }
`;

const Sidebar = ({ collapsed, onToggle, activeTab, setActiveTab }) => {
  return (
    <SidebarContainer $collapsed={collapsed}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <Logo>{!collapsed && 'Ticket System'}</Logo>
        <ToggleButton onClick={onToggle}>
          {collapsed ? '☰' : '✕'}
        </ToggleButton>
      </div>
      
      <Nav>
        <SidebarLink 
          to="/"
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9"></rect>
            <rect x="14" y="3" width="7" height="5"></rect>
            <rect x="14" y="12" width="7" height="9"></rect>
            <rect x="3" y="16" width="7" height="5"></rect>
          </svg>
          {!collapsed && 'ภาพรวม'}
        </SidebarLink>
        
        <SidebarLink 
          to="/tickets"
          className={activeTab === 'tickets' ? 'active' : ''}
          onClick={() => setActiveTab('tickets')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          {!collapsed && 'Tickets'}
        </SidebarLink>
        
        <SidebarLink 
          to="/logs"
          className={activeTab === 'logs' ? 'active' : ''}
          onClick={() => setActiveTab('logs')}
        >
          <FaHistory style={{ marginRight: '10px' }} />
          {!collapsed && 'Log สถานะ'}
        </SidebarLink>
        
        <SidebarLink 
          to="/chat"
          className={activeTab === 'chat' ? 'active' : ''}
          onClick={() => setActiveTab('chat')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          {!collapsed && 'แชท'}
        </SidebarLink>
      </Nav>
    </SidebarContainer>
  );
};

export default Sidebar;

"use client";

import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import styled from "styled-components";
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

import Login from './Login';
import Register from './components/Register';
import PinVerification from './components/PinVerification';
import ActivityLogs from './components/ActivityLogs';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './AuthContext';
import './styles.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardSection from "./DashboardSection";
import StatusLogsPage from './StatusLogsPage';
import NewMessageNotification from './NewMessageNotification';
import AdminTypeGroupManager from './AdminTypeGroupManager';

// Backend API base (change if backend runs elsewhere)
const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:5004';

// Define the type-group-subgroup mapping (default)
const LOCAL_TYPE_GROUP_KEY = 'oa_type_group_subgroup';

// Default fallback mapping – will be overridden by localStorage if present
export const DEFAULT_TYPE_GROUP_SUBGROUP = {
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

// Helper to get latest mapping from localStorage (if edited in Admin page)
export function getTypeGroupSubgroup() {
  try {
    const raw = localStorage.getItem(LOCAL_TYPE_GROUP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse custom type/group mapping:', err);
  }
  return DEFAULT_TYPE_GROUP_SUBGROUP;
}

// Provide a ready constant for simple usage (will capture value on first import)
export const TYPE_GROUP_SUBGROUP = getTypeGroupSubgroup();

// Styled components for layout
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(135deg, #64748b10 0%, #475569 100%);
    opacity: 0.03;
    z-index: 0;
  }

  @media (max-width: 768px) {
    padding: 20px 16px;
    padding-bottom: 80px;
  }
`;

const Sidebar = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: ${props => props.$collapsed ? '60px' : '240px'};
  background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);

  ${props => props.$hovered && props.$collapsed && `
    width: 240px;
  `}

  @media (max-width: 768px) {
    transform: translateX(${props => props.$mobileOpen ? '0' : '-100%'});
    width: 280px;
  }
`;

const Logo = styled.div`
  padding: 20px;
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const NavItem = styled.div`
  padding: 16px 20px;
  color: ${props => props.$active ? '#3b82f6' : 'rgba(255, 255, 255, 0.8)'};
  background: ${props => props.$active ? 'rgba(59, 130, 246, 0.1)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  ${props => props.$collapsed && `
    justify-content: center;
    span {
      display: none;
    }
  `}
`;

const ToggleButton = styled.button`
  position: absolute;
  right: -12px;
  top: 20px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3b82f6;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;

  &:hover {
    background: #2563eb;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const MainContent = styled.div`
  margin-left: ${props => props.$sidebarOpen ? '240px' : '60px'};
  transition: margin-left 0.3s ease;
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const TopNavMobile = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 999;
  }
`;

const MobileMenuBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #334155;
`;

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading } = useAuth();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarHover, setSidebarHover] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Refs for scrolling
  const dashboardRef = useRef(null);
  const listRef = useRef(null);
  const chatRef = useRef(null);

  // Handle mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setSidebarMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll functions
  const scrollToDashboard = () => {
    dashboardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToList = () => {
    listRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToChat = () => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #64748b',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pin-verification" element={<PinVerification />} />
      
      <Route path="/admin-type-group" element={
        <ProtectedRoute requirePinVerification={true}>
          <AdminTypeGroupManager />
        </ProtectedRoute>
      } />
      
      <Route path="/logs" element={
        <ProtectedRoute requirePinVerification={true}>
          <StatusLogsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/activity-logs" element={
        <ProtectedRoute requirePinVerification={true} adminOnly={true}>
          <ActivityLogs />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute requirePinVerification={true}>
          {/* TopNav สำหรับ mobile */}
          {isMobile && (
            <TopNavMobile>
              <MobileMenuBtn onClick={() => setSidebarMobileOpen(!sidebarMobileOpen)}>
                ☰
              </MobileMenuBtn>
              <div>Helpdesk System</div>
              <div style={{ width: '44px' }}></div>
            </TopNavMobile>
          )}
          
          <Sidebar
            $collapsed={!sidebarOpen}
            $hovered={sidebarHover}
            onMouseEnter={() => setSidebarHover(true)}
            onMouseLeave={() => setSidebarHover(false)}
            $mobileOpen={sidebarMobileOpen}
          >
            <Logo>{sidebarOpen || sidebarHover ? "Helpdesk-System" : "HS"}</Logo>
            <ToggleButton
              onClick={() => setSidebarOpen(!sidebarOpen)}
              $collapsed={!sidebarOpen}
            >
              {sidebarOpen ? '‹' : '›'}
            </ToggleButton>
            
            <NavItem
              $active={activeTab === "dashboard"}
              onClick={() => {
                setActiveTab("dashboard");
                scrollToDashboard();
              }}
              $collapsed={!sidebarOpen}
            >
              <span>📊</span>
              <span>Dashboard</span>
            </NavItem>
            
            <NavItem
              $active={activeTab === "list"}
              onClick={() => {
                setActiveTab("list");
                scrollToList();
              }}
              $collapsed={!sidebarOpen}
            >
              <span>📋</span>
              <span>Ticket List</span>
            </NavItem>
            
            <NavItem
              $active={activeTab === "chat"}
              onClick={() => {
                setActiveTab("chat");
                scrollToChat();
              }}
              $collapsed={!sidebarOpen}
            >
              <span>💬</span>
              <span>Chat</span>
            </NavItem>
            
            <NavItem
              $active={activeTab === "logs" || location.pathname === "/logs"}
              onClick={() => {
                setActiveTab("logs");
                navigate("/logs");
              }}
              $collapsed={!sidebarOpen}
            >
              <span>📜</span>
              <span>Status Logs</span>
            </NavItem>
            
            <NavItem
              $active={activeTab === "admin-type-group" || location.pathname === "/admin-type-group"}
              onClick={() => {
                setActiveTab("admin-type-group");
                navigate("/admin-type-group");
              }}
              $collapsed={!sidebarOpen}
            >
              <span>⚙️</span>
              <span>จัดการ Type/Group</span>
            </NavItem>
            
            <NavItem
              $active={activeTab === "activity-logs" || location.pathname === "/activity-logs"}
              onClick={() => {
                setActiveTab("activity-logs");
                navigate("/activity-logs");
              }}
              $collapsed={!sidebarOpen}
            >
              <span>📊</span>
              <span>ประวัติการใช้งาน</span>
            </NavItem>
          </Sidebar>
          
          <MainContent $sidebarOpen={sidebarOpen && !isMobile}>
            <Container>
              <div ref={dashboardRef}>
                <DashboardSection />
              </div>
              
              <div ref={listRef}>
                {/* Ticket List Component would go here */}
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                  <h2>Ticket List Section</h2>
                  <p>รายการ Tickets จะแสดงที่นี่</p>
                </div>
              </div>
              
              <div ref={chatRef}>
                {/* Chat Component would go here */}
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                  <h2>Chat Section</h2>
                  <p>ระบบแชทจะแสดงที่นี่</p>
                </div>
              </div>
            </Container>
          </MainContent>
          
          <ToastContainer />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;

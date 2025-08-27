"use client";

import React from "react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import EmailAlertHistory from './components/EmailAlertHistory';
import EmailTemplateManager from './components/EmailTemplateManager';
import AlertSettings from './components/AlertSettings';
import UserManagement from './components/UserManagement';

import PermissionProvider from './contexts/PermissionContext';

// Base API URL configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE !== undefined ? process.env.REACT_APP_API_BASE : "";

// Standardized date formatting functions
const formatDate = {
  // Standard Thai date format: "31/12/2567"
  thai: (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  },
  
  // Standard Thai date and time format: "31/12/2567, 14:30"
  thaiDateTime: (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  },
  
  // Short Thai date and time format: "31/12/67, 14:30"
  thaiDateTimeShort: (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('th-TH', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  },
  
  // Time only format: "14:30"
  timeOnly: (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  },
  
  // Relative time format: "2 ชั่วโมงที่แล้ว", "3 วันที่แล้ว"
  relative: (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const now = new Date();
    const diffMs = now - d;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'เมื่อสักครู่';
    if (diffMinutes < 60) return `${diffMinutes} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    
    return formatDate.thai(date);
  }
};

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



// Styled components with elegant, modern, and sophisticated design
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
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
    padding: 80px 16px 16px;
    padding-top: 80px;
  }
`;

const Title = styled.h1`
  color: #1e293b;
  text-align: center;
  margin-bottom: 48px;
  font-weight: 700;
  font-size: 2.75rem;
  letter-spacing: -0.025em;
  position: relative;
  z-index: 1;

  &::after {
    content: "";
    display: block;
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, #64748b, #94a3b8);
    margin: 16px auto 0;
    border-radius: 2px;
    opacity: 0.6;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
  position: relative;
  z-index: 1;
`;

const ExportSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${(props) =>
    props.$primary
      ? "linear-gradient(135deg, #475569 0%, #64748b 100%)"
      : "rgba(255, 255, 255, 0.9)"};
  color: ${(props) => (props.$primary ? "white" : "#475569")};
  border: ${(props) => (props.$primary ? "none" : "1px solid #e2e8f0")};
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: ${(props) =>
    props.$primary
      ? "0 4px 12px rgba(71, 85, 105, 0.15)"
      : "0 2px 8px rgba(0, 0, 0, 0.04)"};
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 1rem;
    min-height: 44px;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${(props) =>
    props.$primary
      ? "0 8px 20px rgba(71, 85, 105, 0.25)"
      : "0 4px 12px rgba(0, 0, 0, 0.08)"};
  }

  &:active {
    transform: translateY(0);
  }

  &::before {
    content: "";
    width: 16px;
    height: 16px;
    background-image: ${(props) => (
    props.$primary
      ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z\'/%3E%3C/svg%3E")'
      : 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23475569\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z\'/%3E%3C/svg%3E")'
  )};
    background-size: contain;
    background-repeat: no-repeat;
  }
`;

const Dashboard = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${(props) =>
    props.$accent || "linear-gradient(90deg, #64748b, #94a3b8)"};
    opacity: 0.8;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.85);
  }
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableContainer = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  }
  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 12px;
  }
`;

const TableTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 24px;
  color: #1e293b;
  font-weight: 600;
  letter-spacing: -0.025em;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
`;

const TableHeader = styled.thead`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
`;

const TableHeaderCell = styled.th`
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TableRow = styled.tr`
  transition: all 0.2s ease;
  background-color: ${(props) => props.$bgColor || "#fcfcfc"};
  ${(props) => props.$isSelected && `
    box-shadow: inset 0 0 0 2px #3b82f6;
    background-color: ${props.$bgColor ? `${props.$bgColor} !important` : '#f0f7ff !important'};
    position: relative;
    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background-color: #3b82f6;
    }
  `}
  &:nth-child(even) {
    background-color: ${(props) =>
      props.$bgColor ? props.$bgColor : "#f8fafc"};
  }
  &:hover {
    background-color: ${(props) =>
      props.$bgColor
        ? props.$bgColor === "#fee2e2"
          ? "#ffeaea"
          : props.$bgColor === "#fff7e6"
            ? "#fff3d1"
            : props.$bgColor === "#e6f7ee"
              ? "#d1fae5"
              : "#f3f4f6"
        : "#f3f4f6"};
    transform: scale(1.001);
  }
`;

const TableCell = styled.td`
  padding: 18px 18px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  font-size: 0.92rem;
  color: #334155;
  line-height: 1.6;
  max-width: 180px;
  word-break: break-word;
  white-space: normal;
  overflow-wrap: anywhere;
  background: ${props => props.$isEditing ? '#f1f5f9' : 'transparent'};
  @media (max-width: 768px) {
    padding: 12px 8px;
    font-size: 1rem;
    max-width: none;
    &:nth-child(4),
    &:nth-child(5),
    &:nth-child(8),
    &:nth-child(10),
    &:nth-child(11) {
      display: none;
    }
  }
`;

// Override to disable transition for instant change
const StatusCell = styled(TableCell)`
  transition: none !important;
  max-width: 140px;
  min-width: 100px;
  white-space: nowrap;
  padding: 8px 12px;
  
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    transition: all 0.2s ease;
    white-space: nowrap;
    
    /* Default status style */
    background-color: #e2e8f0;
    color: #475569;
    border: 1px solid #cbd5e1;
    
    /* Updated status specific styles for meaningful colors */
    &[data-status="New"] {
      background-color: #dbeafe; /* Blue background */
      color: #1d4ed8;
      border-color: #93c5fd;
    }
    &[data-status="In Process"] {
      background-color: #fef3c7; /* Yellow/Orange background */
      color: #d97706;
      border-color: #fbbf24;
    }
    &[data-status="Pending"] {
      background-color: #fed7aa; /* Dark Orange/Red-Orange background */
      color: #c2410c;
      border-color: #fb923c;
    }
    &[data-status="Closed"] {
      background-color: #d1fae5; /* Green background */
      color: #059669;
      border-color: #6ee7b7;
    }
    &[data-status="Cancelled"] {
      background-color: #fee2e2; /* Red background */
      color: #dc2626;
      border-color: #fca5a5;
      text-decoration: line-through;
    }
    &[data-status="Reject"] {
      background-color: #fecaca; /* Dark Red background */
      color: #b91c1c;
      border-color: #f87171;
    }
  }
`;

const StatusSelect = styled.select`
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  min-width: 90px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #64748b;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.1);
    background: white;
  }
`;

const SyncIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #64748b;
  font-size: 0.875rem;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: fit-content;
  margin: 0 auto 32px;
  font-weight: 500;

  &::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const BackendStatusIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.875rem;
  padding: 12px 20px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  width: fit-content;
  margin: 0 auto 16px;
  font-weight: 500;
  border: 1px solid;
  transition: all 0.3s ease;

  ${(props) => {
    switch (props.$status) {
      case 'connected':
        return `
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.2);
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
          &::before {
            content: "";
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
            animation: pulse 2s infinite;
          }
        `;
      case 'error':
        return `
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.2);
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
          &::before {
            content: "";
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #ef4444;
            animation: pulse 1s infinite;
          }
        `;
      case 'offline':
        return `
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.2);
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
          &::before {
            content: "";
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #f59e0b;
            animation: pulse 1.5s infinite;
          }
        `;
      default:
        return '';
    }
  }}

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const RetryButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 8px;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &::before {
    content: "";
    width: 12px;
    height: 12px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
  }
`;

const ErrorDetails = styled.div`
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin: 8px 0;
  font-size: 0.85rem;
  color: #ef4444;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);

  .error-header {
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .error-content {
    background: rgba(255, 255, 255, 0.5);
    padding: 12px;
    border-radius: 8px;
    margin-top: 8px;
    border-left: 3px solid #ef4444;
  }

  .error-item {
    margin-bottom: 6px;
    display: flex;
    gap: 8px;
  }

  .error-label {
    font-weight: 500;
    min-width: 80px;
  }

  .error-value {
    color: #dc2626;
  }

  .retry-info {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(239, 68, 68, 0.2);
    font-size: 0.8rem;
    color: #dc2626;
  }
`;

const ChatContainer = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 0;
  border: 1px solid rgba(226, 232, 240, 0.5);
  position: relative;
  z-index: 1;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 500px;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #64748b, #94a3b8);
    border-radius: 16px 16px 0 0;
    opacity: 0.6;
  }
  @media (max-width: 768px) {
    height: 70vh;
    border-radius: 12px;
  }
`;

const ChatHeader = styled.div`
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ChatTitle = styled.h2`
  color: #1e293b;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "";
    width: 24px;
    height: 24px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231e293b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-5l-5 5v-5z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
  }
`;

const ChatStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;

  &::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(248, 250, 252, 0.5);
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 0.95rem;
  line-height: 1.4;
  position: relative;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  word-break: break-word;
  margin-bottom: 8px;
  ${({ $isAdmin }) => $isAdmin 
    ? `
      align-self: flex-end;
      background: #3b82f6;
      color: white;
      border-bottom-right-radius: 4px;
    `
    : `
      align-self: flex-start;
      background: white;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 4px;
    `}
`;
const MessageSender = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 0.85rem;
  color: ${({ $isAdmin }) => $isAdmin ? 'rgba(255,255,255,0.9)' : '#475569'};
`;
const MessageTimeStyled = styled.div`
  font-size: 0.7rem;
  margin-top: 4px;
  text-align: right;
  color: ${({ $isAdmin }) => $isAdmin ? 'rgba(255,255,255,0.7)' : '#64748b'};
`;

const InputContainer = styled.div`
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  background: white;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
`;

const UserSelectContainer = styled.div`
  padding: 0 24px 16px;
  background: white;
`;

const UserSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.9);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
  padding-right: 48px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

  &:focus {
    outline: none;
    border-color: #64748b;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.1);
    background: white;
  }
  option:checked {
    background-color: #3b82f6;
    color: white;
  }
`;

const ChatTextArea = styled.textarea`
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  resize: none;
  min-height: 50px;
  max-height: 150px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.9);
  font-family: inherit;
  line-height: 1.6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

  &:focus {
    outline: none;
    border-color: #64748b;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.1);
    background: white;
  }

  &::placeholder {
    color: #94a3b8;
    opacity: 0.6;
  }
  @media (max-width: 768px) {
    font-size: 1.1rem;
    min-height: 60px;
    padding: 16px;
  }
`;

const SendButton = styled.button`
  padding: 12px 16px;
  background: linear-gradient(135deg, #475569 0%, #64748b 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(71, 85, 105, 0.15);
  height: 50px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(71, 85, 105, 0.25);
  }

  &:active {
    transform: translateY(0);
  }

  &::before {
    content: "";
    width: 18px;
    height: 18px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
  }
`;

const ScrollContainer = styled.div`
  overflow-x: auto;
  border-radius: 12px;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(241, 245, 249, 0.5);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.3);
    border-radius: 3px;
    transition: background 0.2s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 116, 139, 0.5);
  }
`;

const SearchAndFilterContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 250px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #64748b;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.1);
    background: white;
  }

  &::placeholder {
    color: #94a3b8;
  }
  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 1.1rem;
    min-width: 100%;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
  transition: all 0.2s ease;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: #64748b;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.1);
    background: white;
  }
`;

const FilterLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.7);
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const NotificationBell = styled.div`
  position: relative;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(100, 116, 139, 0.1);
  }

  &::before {
    content: "";
    width: 24px;
    height: 24px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 00-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
  }

  ${(props) =>
    props.$hasUnread &&
    `
    &::after {
      content: '';
      position: absolute;
      top: 6px;
      right: 6px;
      width: 8px;
      height: 8px;
      background-color: #ef4444;
      border-radius: 50%;
      border: 2px solid #f8fafc;
    }
  `}
`;

const NotificationDropdown = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  width: 380px;
  max-height: 500px;
  overflow-y: auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  z-index: 100;
  transform-origin: top right;
  transform: ${(props) =>
    props.$visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(-10px)"};
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  visibility: ${(props) => (props.$visible ? "visible" : "hidden")};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: move;
  user-select: none;
`;

const NotificationHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NotificationTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const MarkAllRead = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;

  &:hover {
    background: #f1f5f9;
    color: #475569;
  }
`;

const NotificationItem = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
  }

  ${(props) =>
    props.$unread &&
    `
    background: #f8fafc;
    border-left: 3px solid #3b82f6;
  `}
`;

const NotificationContent = styled.div`
  margin: 0;
  color: #334155;
  font-size: 0.875rem;
  line-height: 1.5;
`;

const NotificationTime = styled.small`
  display: block;
  color: #64748b;
  font-size: 0.75rem;
  margin-top: 8px;
`;

const EmptyNotifications = styled.div`
  padding: 32px;
  text-align: center;
  color: #64748b;
`;
const DateFilterContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
`;

const DateTimeGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 6px;
  }
`;

const DateTimeLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  white-space: nowrap;
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.2s ease;
  min-width: 140px;

  &:focus {
    outline: none;
    border-color: #64748b;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.1);
    background: white;
  }
  
  @media (max-width: 768px) {
    min-width: 120px;
    font-size: 0.8rem;
  }
`;

const TimeInput = styled.input`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.2s ease;
  min-width: 100px;

  &:focus {
    outline: none;
    border-color: #64748b;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.1);
    background: white;
  }
  
  @media (max-width: 768px) {
    min-width: 90px;
    font-size: 0.8rem;
  }
`;

const FilterButton = styled.button`
  padding: 10px 16px;
  background: linear-gradient(135deg, #475569 0%, #64748b 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(71, 85, 105, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ResetButton = styled.button`
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.9);
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 101;

  &:hover {
    color: #475569;
  }
`;

const ClearButton = styled.button`
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 50px;

  &:hover {
    transform: translateY(-2px);
    background: #fee2e2;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &::before {
    content: "";
    width: 18px;
    height: 18px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ef4444'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
  }
`;

const Sidebar = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${(props) => (props.$collapsed ? "80px" : "240px")};
  background: white;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.05);
  z-index: 100;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${(props) =>
    props.$collapsed && !props.$hovered
      ? "translateX(-60px)"
      : "translateX(0)"};

  &:hover {
    transform: translateX(0);
    width: 240px;
  }
  @media (max-width: 768px) {
    transform: translateX(-100%);
    width: 280px;
    z-index: 1000;
    ${props => props.$mobileOpen && `
      transform: translateX(0);
    `}
  }
`;

const Logo = styled.div`
  padding: 0 24px 24px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 24px;

  &::before {
    content: "";
    width: 32px;
    height: 32px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231e293b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
  }
`;

const NavItem = styled.div`
  padding: 12px 24px;
  margin: 4px 0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  color: ${(props) => (props.$active ? "#1e293b" : "#64748b")};
  background: ${(props) => (props.$active ? "#f1f5f9" : "transparent")};
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;

  span {
    opacity: ${(props) => (props.$collapsed ? "1" : "1")};
    transition: opacity 0.2s ease;
  }

  &:hover {
    background: rgb(255, 255, 255);
    color: rgb(0, 98, 255);

    span {
      opacity: 1;
    }
  }

  ${(props) =>
    props.$collapsed &&
    `
    padding: 12px;
    justify-content: center;
    
    &::after {
      content: attr(data-tooltip);
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      background:rgb(236, 209, 88);
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 0.875rem;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      margin-left: 10px;
      white-space: nowrap;
    }
    
    &:hover::after {
      opacity: 1;
    }
  `}
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 20px;
  right: -12px;
  width: 44px;
  height: 44px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 101;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.5);
    background: rgb(0, 128, 255);
  }

  &::before {
    content: "";
    width: 12px;
    height: 12px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 19l-7-7 7-7'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
    transform: ${(props) =>
    props.$collapsed ? "rotate(180deg)" : "rotate(0deg)"};
    transition: transform 0.2s ease;
  }
`;

const MainContent = styled.div`
  margin-left: 240px;
  width: calc(100% - 240px);
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 1rem;
  color: #1e293b;
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s;
  &:hover {
    background: #d32f2f;
  }
`;
//Building

// เพิ่ม styled components สำหรับการ์ดอันดับผู้ใช้
const RankingCard = styled(StatCard)`
  grid-column: span 2;
  min-height: 300px;
  display: flex;
  flex-direction: column;
`;
const RankingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;
const RankingToggleButton = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 4px;
  &:hover { text-decoration: underline; }
`;
const UserRankingList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: rgba(241, 245, 249, 0.5); border-radius: 3px; }
  &::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.3); border-radius: 3px; transition: background 0.2s ease; }
`;
const UserRankingItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;
  transition: all 0.2s ease;
  &:hover { background: #f8fafc; }
`;
const UserRankBadge = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props =>
    props.$rank === 1 ? '#f59e0b' :
    props.$rank === 2 ? '#94a3b8' :
    props.$rank === 3 ? '#b45309' :
    '#e2e8f0'};
  color: ${props => props.$rank <= 3 ? 'white' : '#475569'};
  font-weight: 600;
  margin-right: 12px;
`;
const UserRankingInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
`;
const UserRankingEmail = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  &:hover { text-decoration: underline; color: #3b82f6; }
`;
const UserTicketCount = styled.div`
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
`;

// Styled input สำหรับ inline edit
const EditInput = styled.input`
  padding: 8px 12px;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #f8fafc;
  transition: border 0.2s;
  width: 100%;
  &:focus {
    outline: none;
    border-color: #2563eb;
    background: #fff;
  }
`;


const SaveButton = styled.button`
  background: linear-gradient(90deg, #10b981, #34d399);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  margin-right: 6px;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(16,185,129,0.08);
  &:hover { background: #059669; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

// เพิ่ม ActionButtonGroup, EditButton, DeleteButton
const ActionButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
`;

const EditButton = styled.button`
  background: linear-gradient(90deg, #93c5fd, #3b82f6);
  color: white;
  border: none;
  border-radius: 7px;
  padding: 6px 14px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(59,130,246,0.08);
  transition: background 0.2s;
  &:hover { background: #2563eb; }
`;
const DeleteButton = styled.button`
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 7px;
  padding: 6px 14px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(239,68,68,0.08);
  transition: background 0.2s;
  &:hover { background: #fecaca; color: #b91c1c; }
`;

// ปรับ TableCell สำหรับ REQUESTE/REPORT


// เพิ่ม CSS สำหรับกระพริบ
const BlinkingRow = styled(TableRow)`
  animation: blink 1s linear infinite;
  @keyframes blink {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.5); }
  }
`;
const StatusChangeModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
  margin-top: 0;
  color: #1e293b;
  font-size: 1.25rem;
  margin-bottom: 16px;
`;

const NoteTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 12px;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const RemarksTextarea = styled(NoteTextarea)`
  min-height: 100px;
  background-color: #f8fafc;
  border-color: #cbd5e1;
`;

const ModalButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
`;

const ConfirmButton = styled.button`
  padding: 10px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: #059669;
  }
`;

const CancelButton = styled.button`
  padding: 10px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: #dc2626;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #334155;
`;

const SubLabel = styled.span`
  font-size: 0.8rem;
  color: #64748b;
  display: block;
  margin-top: 2px;
`;

// เพิ่ม styled-components สำหรับ Mobile Responsive
const TopNavMobile = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;
const MobileMenuBtn = styled.button`
  background: none;
  border: none;
  padding: 8px;
  font-size: 1.5rem;
  cursor: pointer;
`;
const MobileNavItemBar = styled.div`
  padding: 8px 12px;
  font-size: 1rem;
  cursor: pointer;
  ${props => props.$active && `
    color: #3b82f6;
    font-weight: 500;
  `}
`;

function App() {
  // AbortController for cancelling in-flight poll requests when we pause polling (prevents flicker)
  const pollControllerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState([]);
  // ข้อความแสดงเมื่อไม่พบข้อมูล
  const [, setNoDataMessage] = useState("");
  const [lastSync, setLastSync] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const filteredDataRef = useRef(null); // Store filtered data to prevent overwriting
  const [, setDateFilteredCount] = useState(0);
  const [notificationPosition, setNotificationPosition] = useState({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarHover, setSidebarHover] = useState(false);
  const [backendStatus, setBackendStatus] = useState('connected'); // 'connected', 'error', 'offline'
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastError, setLastError] = useState(null);
  // Pause backend polling temporarily after ticket updates
  const [isPollingPaused] = useState(false);
  // Current authenticated user info (name, role, etc.) from AuthContext
  const { user: authUser } = useAuth();
  
  // New state variables for pagination and loading
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  // Tickets per page (pagination)
  const rowsPerPage = 5;
  
  // New Chat System State
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatUsers, setChatUsers] = useState([]);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [statusChangeNote, setStatusChangeNote] = useState("");
  const [statusChangeRemarks, setStatusChangeRemarks] = useState("");
  const [tempNewStatus, setTempNewStatus] = useState("");
  const [tempTicketId, setTempTicketId] = useState("");
  const [chatUserSearchTerm, setChatUserSearchTerm] = useState("");

  // Announcement System State (preserved)
  const [announcementMessage, setAnnouncementMessage] = useState("");
  
  const { user, logout } = useAuth();

  const dashboardRef = useRef(null);
  const listRef = useRef(null);
  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Add offline mode handling
  const [offlineData, setOfflineData] = useState([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // เพิ่ม state สำหรับเก็บ ticket ที่ถูกเลือก
  const [selectedTicket, setSelectedTicket] = useState(null);

  // เพิ่ม state สำหรับควบคุมการแสดงอันดับผู้ใช้
  const [showAllRankings, setShowAllRankings] = useState(false);



  // เพิ่ม state สำหรับแก้ไข ticket
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [editForm, setEditForm] = useState({
    type: "",
    group: "",
    subgroup: "",
    email: "",
    name: "",
    phone: "",
    department: "",
    date: "",
    appointment: "",
    appointment_datetime: "",
    request: "",
    report: "",
    status: "New"
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // New state for cascade dropdown
  const [availableGroups, setAvailableGroups] = useState([]);
  const [availableSubgroups, setAvailableSubgroups] = useState([]);
  const [typeGroupMapping, setTypeGroupMapping] = useState(() => {
    const mapping = getTypeGroupSubgroup();

    return mapping;
  });

  // เพิ่ม state สำหรับ mobile responsive
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState("dashboard");

  // --- แจ้งเตือนข้อความใหม่ ---
  const [newMessageAlert, setNewMessageAlert] = useState(null);
  const [lastMessageCheck, setLastMessageCheck] = useState(new Date());
  const [shownPopupIds, setShownPopupIds] = useState(new Set()); // Track notification IDs that already showed popup

  // --- เพิ่ม state สำหรับ highlight ข้อความล่าสุด ---
  const [highlightMsgId, setHighlightMsgId] = useState(null);

  // --- เพิ่ม map userId -> name จาก tickets หลัก ---
  const userIdToNameMap = React.useMemo(() => {
    const map = {};
    data.forEach(ticket => {
      if (ticket.user_id && (ticket["ชื่อ"] || ticket["name"])) {
        map[ticket.user_id] = ticket["ชื่อ"] || ticket["name"];
      }
    });
    return map;
  }, [data]);

  // Load cached data from localStorage when backend is offline
  // BUT NOT when date filtering is active to prevent overriding filtered data
  useEffect(() => {
    // Check if date filtering is currently in progress (immediate check)
    const isCurrentlyFiltering = window.isDateFilteringInProgress || isDateFilterActive;
    if ((backendStatus === 'offline' || backendStatus === 'error') && !isCurrentlyFiltering) {
      const cachedData = localStorage.getItem('cachedTicketData');
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          setOfflineData(parsedData);
          setIsOfflineMode(true);

        } catch (error) {
          console.error("Error parsing cached data:", error);
          setOfflineData([]);
        }
      } else {
        setOfflineData([]);
      }
    } else {
      setIsOfflineMode(false);
      // Cache current data when backend is connected
      if (data.length > 0) {
        localStorage.setItem('cachedTicketData', JSON.stringify(data));
      }
    }
  }, [backendStatus, data, isDateFilterActive]);

  // Optimistic status change with forced re-render
  const forceUpdate = useCallback(() => {
    setData(prev => [...prev]);
  }, []);

  const handleStatusChangeWithNote = (ticketId, newStatus) => {
    // 1. อัพเดท UI ทันทีแบบ Optimistic Update
    // 1. optimistic update & keep immutable array reference
    setData(prev => {
      const newData = prev.map(item => 
      item["Ticket ID"] === ticketId 
        ? { 
            ...item, 
            status: newStatus, 
            สถานะ: newStatus,
            // เพิ่มข้อมูลการอัพเดทล่าสุด
            last_updated: new Date().toISOString(),
            updated_by: authUser?.name || authUser?.pin || "admin"
          } 
        : item
    );
      return [...newData]; // force list reconciliation
    });

    // force component update in case shallow compare caches
    forceUpdate();
    
    // 2. เตรียมข้อมูลสำหรับ modal
    setTempTicketId(ticketId);
    setTempNewStatus(newStatus);
    setStatusChangeNote("");
    setStatusChangeRemarks("");
    
    // 3. เปิด modal
    setShowStatusChangeModal(true);
  }; // end handleStatusChangeWithNote
  const showErrorToast = (message) => {
    // แสดง toast notification
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  };
  
  const showDetailedError = ({ title, message, ticket_id, original_status, attempted_status }) => {
    // แสดง detailed error modal หรือ notification
    setErrorDetails({
      title,
      message,
      timestamp: new Date().toISOString(),
      ticket_id,
      original_status,
      attempted_status,
      user: authUser?.name || authUser?.pin || "admin"
    });
  };
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [setErrorDetails] = useState(null);
  const errorTimeoutRef = useRef(null);
  // Confirm change – simplified (no polling pause / rollback handled inline)
  const confirmStatusChange = async () => {
    // 1. เก็บข้อมูลสถานะก่อนการอัพเดทเพื่อใช้ rollback
    const originalData = [...data];
    const ticketToUpdate = originalData.find(t => t["Ticket ID"] === tempTicketId);
    const originalStatus = ticketToUpdate?.สถานะ || ticketToUpdate?.status;
  
    // 2. ปิด modal และเตรียมสถานะ
    setShowStatusChangeModal(false);
    setEditingTicketId(null);
    setIsUpdatingStatus(true);
    // polling disabled – no need to pause
  
    try {
      // 3. ส่งข้อมูลไป backend
      const response = await axios.post(
        `${API_BASE_URL}/update-status`,
        {
          ticket_id: tempTicketId,
          status: tempNewStatus,
          changed_by: authUser?.name || authUser?.pin || "admin",
          note: statusChangeNote,
          remarks: statusChangeRemarks,
          updated_at: new Date().toISOString()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            // เพิ่ม headers ที่จำเป็น
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );
  
      // 4. จัดการผลลัพธ์
      if (response.data.success) {
        // 4.1 อัพเดท UI แบบ Optimistic
        // update local data again to ensure freshest state
      const updateLocalData = (items) =>
          items.map((item) =>
            item["Ticket ID"] === tempTicketId
              ? {
                  ...item,
                  status: tempNewStatus,
                  สถานะ: tempNewStatus,
                  last_updated: new Date().toISOString(),
                  updated_by: authUser?.name || authUser?.pin || "admin"
                }
              : item
          );
  
        // 4.2 อัพเดทข้อมูลตาม mode การทำงาน
        if (isOfflineMode) {
          setOfflineData(prev => updateLocalData(prev));
          localStorage.setItem(
            "cachedTicketData",
            JSON.stringify(updateLocalData(offlineData))
          );
        } else {
          setData(prev => updateLocalData(prev));
        }
  
        // 4.3 แสดงข้อความสำเร็จ
        setEditSuccess("อัปเดตสถานะและบันทึกหมายเหตุเรียบร้อยแล้ว");
        setTimeout(() => setEditSuccess(""), 3000);
  
        // 4.4 ดึงข้อมูลใหม่เพื่อ sync
        await fetchData();
  
      } else {
        // 5. จัดการกรณี backend ตอบกลับ error
        console.error("Backend update failed:", response.data.error);
        setData(originalData); // rollback
        setEditError(
          response.data.error || "เกิดข้อผิดพลาดในการอัปเดตสถานะ"
        );
        
        // แสดง toast หรือ notification
        showErrorToast(`ไม่สามารถอัพเดตสถานะได้: ${response.data.error}`);
      }
    } catch (error) {
      // 6. จัดการกรณีเกิด error ในการเชื่อมต่อ
      console.error("Error updating status:", error);
      setData(originalData); // rollback
      setEditError(
        "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง"
      );
      
      // แสดงรายละเอียด error
      showDetailedError({
        title: "การอัพเดทสถานะล้มเหลว",
        message: error.message,
        ticket_id: tempTicketId,
        original_status: originalStatus,
        attempted_status: tempNewStatus
      });
    } finally {
      // 7. Reset สถานะทั้งหมด
      setIsUpdatingStatus(false);
      // polling disabled – nothing to resume
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => setEditError(""), 20000);
    }
  };
  const LoadingIndicator = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: #3b82f6;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;



const cancelStatusChange = () => {
  setShowStatusChangeModal(false);
};

  // Use offline data when backend is unavailable
  const displayData = isOfflineMode ? offlineData : data;

  // ฟังก์ชันเลื่อนไปยังส่วนต่างๆ ตามเมนูที่กด
  const scrollToDashboard = () => {
    // เลื่อนไปบนสุด (Dashboard)
    dashboardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToList = () => {
    // เลื่อนไปตรงตาราง (Ticket List)
    listRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToChat = () => {
    // เลื่อนไปตรงแชท (Chat Section)
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ฟังก์ชันเลื่อนแชทไปข้อความล่าสุด (เฉพาะในกรอบแชท)
  const scrollToLatestMessage = () => {
    // เลื่อนไปข้อความล่าสุดในกรอบแชท
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Health check function to test backend connectivity
  
  // ฟังก์ชันสำหรับดึงข้อมูล notifications จาก backend
  const fetchNotifications = useCallback(async () => {
    try {
      console.log('🔄 Fetching notifications...');
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      console.log('📥 Raw notifications response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Parse meta_data if it's a string
        const parsedNotifications = response.data.map(n => ({
          ...n,
          meta_data: typeof n.meta_data === 'string' ? JSON.parse(n.meta_data) : n.meta_data
        }));
        
        console.log('📋 Parsed notifications:', parsedNotifications);
        
        // Use setNotifications with callback to get previous state properly
        setNotifications(prevNotifications => {
          console.log('📊 Previous notifications count:', prevNotifications.length);
          console.log('📊 New notifications count:', parsedNotifications.length);
          
          // Debug: Show all unread notifications
          const allUnread = parsedNotifications.filter(n => !n.read);
          console.log('📌 All unread notifications:', allUnread);
          
          // Debug: Show notifications with new_message type
          const messageTypeNotifs = parsedNotifications.filter(n => n.meta_data?.type === 'new_message');
          console.log('💬 Notifications with type=new_message:', messageTypeNotifs);
          
          // Check for new unread messages and trigger popup
          const newUnreadMessages = parsedNotifications.filter(n => {
            const isUnread = !n.read;
            const isNewMessage = n.meta_data?.type === 'new_message' || n.meta_data?.type === 'textbox_message';
            const isFromUser = n.meta_data?.sender_type === 'user' || n.meta_data?.type === 'textbox_message';
            const isNew = !prevNotifications.some(prev => prev.id === n.id);
            const notShownPopup = !shownPopupIds.has(n.id); // Check if popup was NOT already shown for this notification
            
            console.log(`🔍 Checking notification ${n.id}:`, {
              isUnread,
              isNewMessage,
              isFromUser,
              isNew,
              notShownPopup,
              meta_data: n.meta_data
            });
            
            // Only show popup for truly new messages that haven't been shown before
            return isUnread && isNewMessage && isFromUser && isNew && notShownPopup;
          });
          
          console.log('🆕 New unread messages found:', newUnreadMessages.length);
          
          // Trigger popup for the latest new message
          if (newUnreadMessages.length > 0) {
            const latestMessage = newUnreadMessages[0];
            console.log('🔔 TRIGGERING POPUP for message:', latestMessage);
            
            // Mark this notification as shown
            setShownPopupIds(prev => {
              const newSet = new Set(prev);
              newSet.add(latestMessage.id);
              return newSet;
            });
            
            const alertData = {
              user_id: latestMessage.meta_data.user_id,
              user: latestMessage.sender_name || latestMessage.meta_data?.sender_name || 'User',
              message: latestMessage.message,
              timestamp: latestMessage.timestamp,
              notificationId: latestMessage.id // Add notification ID to track it
            };
            
            console.log('📢 Setting newMessageAlert with:', alertData);
            setNewMessageAlert(alertData);
            
            // Play notification sound
            try {
              const audio = new Audio('/notification.mp3');
              audio.play().catch(e => console.log('🔇 Could not play sound:', e));
            } catch (e) {
              console.log('🔇 Audio error:', e);
            }
          } else {
            console.log('ℹ️ No new messages to show popup for');
          }
          
          return parsedNotifications;
        });
        
        // Check if there are unread notifications
        const hasUnreadNotifications = parsedNotifications.some(n => !n.read);
        console.log('🔴 Has unread notifications:', hasUnreadNotifications);
        setHasUnread(hasUnreadNotifications);
      }
    } catch (error) {
      console.error("❌ Failed to fetch notifications:", error);
    }
  }, []);

  // ฟังก์ชันสำหรับดึงข้อความจาก textbox ทุก ticket พร้อมกัน
  const processAllTextboxMessages = useCallback(async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/process-all-textbox-messages`, {}, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout for processing all
      });
      
      // รีเฟรช notifications หลังจากประมวลผลเสร็จ
      if (response.data.processed > 0) {
        // Trigger notification refresh
        await fetchNotifications();
        // Also refresh chat messages if a user is selected
        if (selectedChatUser && selectedChatUser !== "announcement") {
          loadChatMessages(selectedChatUser);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error("Failed to process textbox messages:", error.message);
      throw error;
    }
  }, [fetchNotifications, selectedChatUser]);
  
  // Updated fetchData function with loading state and date filter protection
  const fetchData = useCallback(async () => {
    // Don't fetch if date filtering is active to avoid overwriting filtered data
    if (isDateFilterActive) {

      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/data`, {
        params: { ts: Date.now() },
        headers: { 'Cache-Control': 'no-cache' }
      });
      setData(Array.isArray(response.data) ? response.data : []);
      setLastSync(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [isDateFilterActive]);

  useEffect(() => {
    // Only fetch data on initial load if no date filter is active
    if (!isDateFilterActive) {
      fetchData();
    }
  }, [fetchData, isDateFilterActive]);

  // --- Polling แทน Socket.IO ---
  useEffect(() => {
    // ฟังก์ชันดึงข้อมูล ticket
    const pollData = async () => {
  // do not poll while paused
  if (isPollingPaused) return;
  // do not poll when date filtering is active to avoid overwriting filtered data
  if (isDateFilterActive) return;
  // cancel any previous unfinished fetch just in case
  if (pollControllerRef.current) pollControllerRef.current.abort();
  const controller = new AbortController();
  pollControllerRef.current = controller;
      try {
        const response = await fetch(`${API_BASE_URL}/api/data?ts=${Date.now()}`, {
          signal: controller.signal,
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache"
          }
        });
        const data = await response.json();
        setData(Array.isArray(data) ? data : []);
        setLastSync(new Date());
        setBackendStatus('connected');
        setLastError(null);
      } catch (error) {
        console.error('Polling error:', error);
        setBackendStatus('offline');
        setLastError({
          status: 'NETWORK',
          message: 'Polling error',
          details: error.message
        });
      }
    };

    // Poll ทันทีเมื่อโหลดหน้า (หากไม่ได้ pause)
    if (!isPollingPaused) {
      pollData();
    }
    // Poll ทุก 5 วินาที โดยจะข้ามหากกำลัง pause
    const interval = setInterval(() => {
      if (!isPollingPaused) {
        pollData();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPollingPaused, isDateFilterActive]);

  // Polling for notifications
  useEffect(() => {
    // Fetch notifications immediately
    fetchNotifications();
    
    // Poll notifications every 10 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      setNotificationPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      });
    },
    [isDragging, startPos.x, startPos.y]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = useCallback(
    (e) => {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - notificationPosition.x,
        y: e.clientY - notificationPosition.y,
      });
    },
    [notificationPosition.x, notificationPosition.y]
  );

  // สถานะต่างๆ พร้อมการออกแบบที่สวยงาม
  const STATUS_OPTIONS = [
    { 
      value: "New", 
      label: "New", 
      color: "#e0f2fe",
      textColor: "#0369a1",
      borderColor: "#bae6fd",
      icon: "🆕"
    },
    { 
      value: "In Process", 
      label: "In Process", 
      color: "#e0e7ff",
      textColor: "#4338ca",
      borderColor: "#c7d2fe",
      icon: "⚙️"
    },
    { 
      value: "Pending", 
      label: "Pending", 
      color: "#fffbeb",
      textColor: "#b45309",
      borderColor: "#fde68a",
      icon: "⏳"
    },
    { 
      value: "Closed", 
      label: "Closed", 
      color: "#ecfdf5",
      textColor: "#047857",
      borderColor: "#a7f3d0",
      icon: "✅"
    },
    { 
      value: "Cancelled", 
      label: "Cancelled", 
      color: "#f9fafb",
      textColor: "#4b5563",
      borderColor: "#e5e7eb",
      icon: "❌"
    },
    { 
      value: "Reject", 
      label: "Reject", 
      color: "#fef2f2",
      textColor: "#b91c1c",
      borderColor: "#fecaca",
      icon: "⛔"
    },
  ];
  

  const getRowColor = (createdAt, status) => {
    const statusObj = STATUS_OPTIONS.find(s => s.value === status);
    return statusObj ? statusObj.color : "";
  };



  // ---- Fetch latest Type/Group/Subgroup mapping on startup (inside component)
  useEffect(() => {
    axios.get(`${API_BASE_URL}/type-group-subgroup`)
      .then(res => {
        if (res.data && typeof res.data === 'object') {
          const backendStr = JSON.stringify(res.data);
          const localStr = localStorage.getItem(LOCAL_TYPE_GROUP_KEY);
          if (!localStr || localStr !== backendStr) {
            localStorage.setItem(LOCAL_TYPE_GROUP_KEY, backendStr);
            setTypeGroupMapping(res.data);

          }
        }
      })
      .catch(err => console.warn('[App] Failed to fetch type/group mapping from backend', err));
  }, []);

  // --- Listen for type/group data updates from AdminTypeGroupManager -----
  useEffect(() => {
    const handleTypeGroupUpdate = (event) => {

      const oldMapping = typeGroupMapping;
      const newMapping = getTypeGroupSubgroup(); // Re-read from localStorage

      
      // Force re-render by creating new object reference
      setTypeGroupMapping({ ...newMapping });

      
      // Force component re-render
      setCurrentPage(prev => prev); // This will trigger a re-render
      
      // Update current dropdown options if editing a ticket
      if (editingTicketId && editForm.type) {

        const newGroupOptions = Object.keys(newMapping[editForm.type] || {});
        
        // Clean group value to match available options
        if (editForm.group && !newGroupOptions.includes(editForm.group)) {

          setEditForm(prev => ({ ...prev, group: '', subgroup: '' }));
          setAvailableSubgroups([]);
        } else if (editForm.group) {
          const newSubgroupOptions = (newMapping[editForm.type] || {})[editForm.group] || [];
          setAvailableSubgroups(newSubgroupOptions);
          
          // If current subgroup is no longer valid, reset it
          if (editForm.subgroup && !newSubgroupOptions.includes(editForm.subgroup)) {

            setEditForm(prev => ({ ...prev, subgroup: '' }));
          }
        }
      } else {

      }
    };
    

    window.addEventListener('typeGroupDataUpdated', handleTypeGroupUpdate);
    return () => {

      window.removeEventListener('typeGroupDataUpdated', handleTypeGroupUpdate);
    };
  }, [editingTicketId, editForm.type, editForm.group, editForm.subgroup, typeGroupMapping]);

  const fetchDataByDate = () => {
    if (!startDate) return;

    axios
      .get(`${API_BASE_URL}/api/data-by-date`, {
        params: { date: startDate },
      })
      .then((res) => {
        setData(Array.isArray(res.data) ? res.data : []);
        setIsDateFilterActive(true);
      })
      .catch((err) => {
        console.error("Error fetching data by date:", err);
        setData([]); // Reset to empty array on error
      });
  };



  const fetchDataByDateRange = () => {
    // --- Frontend Validation ---
    if (!startDate || !endDate) {
      toast.error("กรุณาระบุวันที่เริ่มต้นและสิ้นสุด");
      return;
    }
    if (startDate > endDate) {
      toast.error("วันที่เริ่มต้องไม่มากกว่าวันสิ้นสุด");
      return;
    }


    
    // CRITICAL: Set date filter active FIRST and stop all polling immediately
    setIsDateFilterActive(true);
    
    // Set immediate global flag to prevent race condition with offline data
    window.isDateFilteringInProgress = true;
    
    // Cancel any ongoing polling
    if (pollControllerRef.current) {
      pollControllerRef.current.abort();

    }

    // Use the existing data API to get all data, then filter by date range
    axios
      .get(`${API_BASE_URL}/api/data`, {
        params: { ts: Date.now() },
        headers: { 'Cache-Control': 'no-cache' }
      })
      .then((res) => {
        // Double-check filter is still active (in case of race condition)

        
        const rawData = Array.isArray(res.data) ? res.data : [];


        // Filter by created_at (วันที่แจ้ง) instead of appointment
        const filteredData = rawData.filter((item) => {
          const createdAtField = item['วันที่แจ้ง'] || item.created_at;
          if (!createdAtField) {

            return false;
          }
          
          const createdDate = new Date(createdAtField);
          if (isNaN(createdDate.getTime())) {

            return false;
          }
          
          // Create start and end datetime for comparison
          const startDateTime = new Date(`${startDate}${startTime ? `T${startTime}:00` : 'T00:00:00'}`);
          const endDateTime = new Date(`${endDate}${endTime ? `T${endTime}:59` : 'T23:59:59'}`);
          
          // Check if created date is within the datetime range
          const inRange = createdDate >= startDateTime && createdDate <= endDateTime;
          
          const createdDateStr = createdDate.toISOString().split('T')[0];
          const createdTimeStr = createdDate.toTimeString().split(' ')[0].substring(0, 5);
          
          if (inRange) {

          } else {

          }
          
          return inRange;
        });
        

        
        // Set the filtered data and count

        // Store filtered data in ref to prevent overwriting
        filteredDataRef.current = filteredData;
        setData(filteredData);
        setDateFilteredCount(filteredData.length);
        setNoDataMessage(filteredData.length === 0 ? 
          `ไม่พบข้อมูลในช่วงวันที่แจ้ง ${startDate} ถึง ${endDate}` : "");
        
        // Clear global flag after filtering is complete
        window.isDateFilteringInProgress = false;
        
        // Force re-render and confirm filter status
        setTimeout(() => {

          setIsDateFilterActive(true); // Ensure it stays active
        }, 100);
      })
      .catch((err) => {
        console.error("Error fetching data by date range:", err);
        // Reset filter state on error
        setIsDateFilterActive(false);
        
        // Fallback to regular data fetch if date range API doesn't exist
        if (err.response?.status === 404) {
          console.warn("Date range API not available, using single date filter");
          toast.warn("ไม่พบ API ช่วงวันที่ ใช้การกรองแบบวันเดียวแทน");
          if (startDate) {
            fetchDataByDate();
          }
        } else {
          setData([]); // Reset to empty array on error
          setNoDataMessage("เกิดข้อผิดพลาดในการโหลดข้อมูล");
          toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        }
      });
  };

  const resetDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setIsDateFilterActive(false);
    setDateFilteredCount(0);
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");

    axios
      .get(`${API_BASE_URL}/api/data`)
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error(err);
        setData([]); // Reset to empty array on error
      });
  };
  // Add this function to mark notifications as read
  const markAsRead = (id = null) => {
    if (id) {
      // Mark single notification as read
      axios
        .post(`${API_BASE_URL}/mark-notification-read`, { id })
        .then(() => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
          );
          setHasUnread(notifications.some((n) => !n.read && n.id !== id));
        });
    } else {
      // Mark all notifications as read
      axios
        .post(`${API_BASE_URL}/api/mark-all-notifications-read`)
        .then(() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          setHasUnread(false);
        });
    }
  };
  // Filter data based on search and filters
  // Use data directly which contains the filtered results from fetchDataByDateRange
  // Wrap with useMemo to prevent unnecessary recalculations
  const filteredData = useMemo(() => {
    // Use filtered data from ref when date filtering is active to prevent jumping
    const sourceData = isDateFilterActive && filteredDataRef.current ? filteredDataRef.current : data;
    return Array.isArray(sourceData)
      ? sourceData.filter((row) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        row["อีเมล"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row["ชื่อ"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row["เบอร์ติดต่อ"]
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        row["แผนก"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row["Ticket ID"]?.toString().includes(searchTerm);

      // Status filter logic:
      // - "all" always excludes Closed tickets (both with and without date filter)
      // - "Closed" shows only Closed tickets
      // - Other statuses show only that specific status
      const matchesStatus =
        statusFilter === "all"
          ? row["สถานะ"] !== "Closed"
          : row["สถานะ"] === statusFilter;

      // Type filter
      const matchesType = typeFilter === "all" || (row["Type"] || "").toUpperCase() === typeFilter;

      // Hide 'Information' type by default unless explicitly filtered
      const isInformationType = (row["Type"] || "").toUpperCase() === "INFORMATION";
      const shouldShowInformation = typeFilter === "INFORMATION";
      const typeFiltering = shouldShowInformation || !isInformationType;

        return matchesSearch && matchesStatus && matchesType && typeFiltering;
      })
      : [];
  }, [data, searchTerm, statusFilter, typeFilter, isDateFilterActive]);



  // Pagination logic
  const sortedFilteredData = [...filteredData].sort((a, b) => {
    const dateA = a["วันที่แจ้ง"] ? new Date(a["วันที่แจ้ง"]) : new Date(0);
    const dateB = b["วันที่แจ้ง"] ? new Date(b["วันที่แจ้ง"]) : new Date(0);
    return dateB - dateA;
  });

  const paginatedData = sortedFilteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(sortedFilteredData.length / rowsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, startDate, isDateFilterActive]);

  // Get unique types for filter dropdown
  // Build list of unique types (case-insensitive) in canonical UPPERCASE form
  const uniqueTypes = [...new Set(displayData.map(item => (item["Type"] || "").toUpperCase()).filter(t => t))];

  
  const handleUserSelect = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === "announcement") {
      setSelectedChatUser("announcement");
      setAnnouncementMessage("");
    } else {
      setSelectedChatUser(selectedValue);
      setNewMessage("");
      // Load chat messages for selected user
      if (selectedValue) {
        loadChatMessages(selectedValue);
      }
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/api/delete-notification`, { id });
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };





  // Dropdown change handlers for ticket editing
  const handleTypeChange = (e) => {
    const newType = e.target.value;

    
    setEditForm(prev => ({ ...prev, type: newType, group: '', subgroup: '' }));
    
    // Update available groups
    const newGroups = Object.keys(typeGroupMapping[newType] || {});

    setAvailableGroups(newGroups);
    setAvailableSubgroups([]);
  };
  
  const handleGroupChange = (e) => {
    const newGroup = e.target.value;

    
    setEditForm(prev => ({ ...prev, group: newGroup, subgroup: '' }));
    
    // Update available subgroups
    const newSubgroups = (typeGroupMapping[editForm.type] || {})[newGroup] || [];

    setAvailableSubgroups(newSubgroups);
  };
  
  const handleSubgroupChange = (e) => {
    const newSubgroup = e.target.value;

    
    setEditForm(prev => ({ ...prev, subgroup: newSubgroup }));
  };

  // Handle edit ticket - initialize edit form with ticket data
  const handleEditTicket = (ticket) => {
    setEditingTicketId(ticket["Ticket ID"]);
    
    // Extract ticket data with proper field mapping based on backend structure
    const type = ticket["Type"] || ticket["TYPE"] || ticket["type"] || "";
    
    // Extract group based on ticket type
    let rawGroup = "";
    if (type.toUpperCase() === "HELPDESK") {
      // For Helpdesk tickets, group is in Report field
      rawGroup = ticket["Report"] || ticket["report"] || "";
    } else if (type.toUpperCase() === "SERVICE") {
      // For Service tickets, group is in requested field
      rawGroup = ticket["requested"] || ticket["Requested"] || ticket["Requeste"] || ticket["request"] || "";
    } else {
      // Fallback to standard Group fields
      rawGroup = ticket["GROUP"] || ticket["Group"] || ticket["group"] || "";
    }
    
    // Backend sends Subgroup
    const rawSubgroup = ticket["Subgroup"] || ticket["SUBGROUP"] || ticket["subgroup"] || "";
    
    // Get current status - IMPORTANT: Use actual value, not "SELECT"
    const currentStatus = ticket["สถานะ"] || ticket["Status"] || ticket["status"] || "New";
    
    // Clean values BEFORE setting state
    let cleanedGroup = rawGroup;
    let cleanedSubgroup = rawSubgroup;
    
    if (type) {
      const groups = Object.keys(typeGroupMapping[type] || {});
      
      // Clean group value to match available options
      if (rawGroup && !groups.includes(rawGroup)) {
        // Try to find a match by removing extra text (e.g., "ปริ้นเตอร์ / Printer" -> "ปริ้นเตอร์")
        const possibleMatch = groups.find(g => {
          return rawGroup.includes(g) || g.includes(rawGroup.split(' / ')[0]) || g.includes(rawGroup.split('/')[0].trim());
        });
        if (possibleMatch) {
          cleanedGroup = possibleMatch;
        }
      }
      
      // Clean subgroup value
      if (cleanedGroup) {
        const subgroups = (typeGroupMapping[type] || {})[cleanedGroup] || [];
        
        if (rawSubgroup && !subgroups.includes(rawSubgroup)) {
          // Try to find a match by removing extra text
          const possibleSubgroupMatch = subgroups.find(sg => {
            return rawSubgroup.includes(sg) || sg.includes(rawSubgroup.split(' / ')[0]) || sg.includes(rawSubgroup.split('/')[0].trim());
          });
          
          if (possibleSubgroupMatch) {
            cleanedSubgroup = possibleSubgroupMatch;
          } else {
            // If no match found, clear the subgroup
            cleanedSubgroup = "";
          }
        }
        
        setAvailableGroups(groups);
        setAvailableSubgroups(subgroups);
      } else {
        setAvailableGroups(groups);
        setAvailableSubgroups([]);
      }
    } else {
      setAvailableGroups([]);
      setAvailableSubgroups([]);
    }
    
    // Set form data with ALL cleaned values in a SINGLE update
    setEditForm({
      type,
      group: cleanedGroup,
      subgroup: cleanedSubgroup,
      email: ticket["อีเมล"] || ticket["Email"] || "",
      name: ticket["ชื่อ"] || ticket["Name"] || "",
      phone: ticket["เบอร์ติดต่อ"] || ticket["เบอร์โทร"] || ticket["Phone"] || ticket["phone"] || "",
      department: ticket["แผนก"] || ticket["Department"] || "",
      date: ticket["วันที่แจ้ง"] || ticket["Date"] || "",
      appointment: ticket["Appointment"] || "",
      appointment_datetime: ticket["appointment_datetime"] || "",
      request: ticket["requested"] || ticket["request"] || "",
      report: ticket["Report"] || "",
      status: currentStatus  // Use the actual current status value
    });
  };

  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
      try {
        // Get ticket details before deletion for logging
        const ticketToDelete = data.find(item => item["Ticket ID"] === ticketId);
        
        const token = localStorage.getItem('access_token');
        const response = await axios.post(
          `${API_BASE_URL}/delete-ticket`,
          { ticket_id: ticketId },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {

          
          // Log the ticket deletion activity with user info
          try {
            // Get current user info for logging
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const deletedBy = currentUser.username || currentUser.display_name || 'Unknown User';
            
            await axios.post(
              `${API_BASE_URL}/api/activity-log`,
              {
                action: 'delete_ticket',
                details: {
                  ticket_id: ticketId,
                  ticket_name: ticketToDelete?.["Name"] || 'Unknown',
                  ticket_department: ticketToDelete?.["Department"] || 'Unknown',
                  ticket_status: ticketToDelete?.["Status"] || 'Unknown',
                  deleted_by: deletedBy,
                  deleted_by_user_id: currentUser.user_id || null,
                  deleted_at: new Date().toISOString(),
                  action_description: `Ticket #${ticketId} ถูกลบโดย ${deletedBy}`
                }
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              }
            );
          } catch (logError) {
            console.warn('Failed to log ticket deletion:', logError);
          }
          
          // อัปเดต state เพื่อลบ ticket ออกจาก UI
          setData((prevData) =>
            prevData.filter((item) => item["Ticket ID"] !== ticketId)
          );
          alert(response.data.message || "ลบ Ticket สำเร็จ");
        } else {
          alert(response.data.error || "Failed to delete ticket");
        }
      } catch (err) {
        console.error("❌ Failed to delete ticket:", err);
        alert(
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to delete ticket: " + err.message
        );
      }
    }
  };

  // Removed stray edit-form initialization block (moved code belongs inside the edit handler)

// New Chat Functions
const loadChatMessages = async (userId) => {
  if (!userId || userId === "announcement") return;

  setLoadingChat(true);
  
  // Store current messages to prevent disappearing
  const currentMessages = chatMessages;
  
  try {
    // 1. ดึงข้อความจาก textbox มาใส่ในแชทก่อน
    try {
      await axios.post(`${API_BASE_URL}/api/process-textbox-messages`, {
        ticket_id: userId
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });
    } catch (textboxError) {
      // ไม่ให้ error นี้หยุดการทำงาน - ยังคงดึงข้อความต่อไป

    }

    // 2. แล้วค่อยดึงข้อความทั้งหมดมาแสดง
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${API_BASE_URL}/api/messages`, {
      params: { user_id: userId },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Only update if we got valid data, otherwise keep current messages
    if (response.data && Array.isArray(response.data)) {
      setChatMessages(response.data);
    } else {
      // Keep current messages on error instead of clearing
      setChatMessages(currentMessages);
    }

    // เลื่อนไปข้อความล่าสุดหลังจากโหลดข้อความเสร็จ
    setTimeout(() => {
      scrollToLatestMessage();
    }, 100);
  } catch (error) {
    console.error("Failed to load chat messages:", error);
    // Keep current messages on error instead of clearing
    setChatMessages(currentMessages);
  } finally {
    setLoadingChat(false);
  }
};

// Function removed - duplicate declaration exists above

const sendChatMessage = async () => {
  if (!selectedChatUser || !newMessage.trim() || selectedChatUser === "announcement") return;

  try {
    setLoadingChat(true);
    const payload = {
      user_id: selectedChatUser,
      sender_type: 'admin', // ต้องเป็น 'admin' (ตัวเล็ก)
      message: newMessage
    };
    const token = localStorage.getItem('access_token');
    const response = await axios.post(`${API_BASE_URL}/api/messages`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Add new message to local state (ถ้า backend ส่งกลับ message ใหม่)
    setChatMessages(prev => [
      ...prev,
      response.data || {
        id: Date.now(),
        user_id: selectedChatUser,
        sender_type: 'admin',
        message: newMessage,
        timestamp: new Date().toISOString()
      }
    ]);
    setNewMessage("");
    
    // เลื่อนไปข้อความล่าสุดหลังจากส่งข้อความใหม่
    setTimeout(() => {
      scrollToLatestMessage();
    }, 100);
    
    // Trigger notification check immediately after sending message
    // This ensures other admins get notified right away
    setTimeout(() => {
      checkForNewMessages();
    }, 500);
  } catch (error) {
    console.error("Failed to send chat message:", error);
    if (error.response && error.response.data) {
      console.error("Backend error message:", error.response.data);
      alert("Error: " + (error.response.data.error || JSON.stringify(error.response.data)));
    } else {
      alert("Failed to send message. Please try again.");
    }
  } finally {
    setLoadingChat(false);
  }
};

  const clearChatHistory = async () => {
    if (!selectedChatUser || selectedChatUser === "announcement") return;

    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการสนทนาทั้งหมด?")) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.post(`${API_BASE_URL}/api/messages/delete`, {
          user_id: selectedChatUser
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        setChatMessages([]);
        alert("ลบประวัติการสนทนาสำเร็จ");
      } catch (error) {
        console.error("Failed to clear chat history:", error);
        alert("เกิดข้อผิดพลาดในการลบประวัติการสนทนา");
      }
    }
  };

  // Announcement Functions (preserved)
  const sendAnnouncement = async () => {
    if (!announcementMessage.trim()) return;

    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการส่งประกาศนี้ไปยังสมาชิกทั้งหมด?")) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      
      // Check if token exists
      if (!token) {
        alert("กรุณาเข้าสู่ระบบใหม่เพื่อส่งประกาศ");
        // Redirect to login page
        window.location.href = '/login';
        return;
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/api/send-announcement`,
        { message: announcementMessage },
        { 
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          } 
        }
      );

      if (response.data.success) {
        alert(`ส่งประกาศสำเร็จไปยัง ${response.data.recipients} คน`);
        setAnnouncementMessage("");

        setNotifications((prev) => [
          {
            id: Date.now(),
            message: `ประกาศใหม่: ${announcementMessage}`,
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]);
        setHasUnread(true);
      } else {
        alert("เกิดข้อผิดพลาดในการส่งประกาศ");
      }
    } catch (err) {
      console.error("❌ Failed to send announcement:", err);
      
      // Check if error is due to expired token (401 Unauthorized)
      if (err.response && err.response.status === 401) {
        // Clear expired token
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        
        alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
        // Redirect to login page
        window.location.href = '/login';
      } else {
        alert("เกิดข้อผิดพลาดในการส่งประกาศ");
      }
    }
  };

  // Add this useEffect to fetch chat users from /api/chat-users
  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/chat-users`);
        // response.data should be an array of { user_id, name }
        setChatUsers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to fetch chat users:", error);
        setChatUsers([]);
      }
    };
    fetchChatUsers();
  }, []);

  // Polling for new messages
  useEffect(() => {
    if (!selectedChatUser || selectedChatUser === "announcement") return;

    const pollMessages = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_BASE_URL}/api/messages`, {
          params: { user_id: selectedChatUser },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          // Check for new messages and trigger notification
          const prevMessages = chatMessages;
          const newMessages = response.data.filter(msg => 
            msg.sender_type === 'user' &&
            !prevMessages.some(prev => prev.id === msg.id)
          );
          
          // Trigger popup for new user messages
          if (newMessages.length > 0 && selectedChatUser !== newMessages[0].user_id) {
            const latestNewMsg = newMessages[newMessages.length - 1];
            const userName = chatUsers.find(u => u.user_id === latestNewMsg.user_id)?.name || 'User';
            
            setNewMessageAlert({
              user_id: latestNewMsg.user_id,
              user: userName,
              message: latestNewMsg.message,
              timestamp: latestNewMsg.timestamp
            });
          }
          
          setChatMessages(response.data);
        }
      } catch (error) {
        // Don't log error to reduce console spam
      }
    };

    // Poll immediately
    pollMessages();
    
    // Set up polling every 3 seconds
    const interval = setInterval(pollMessages, 3000);
    
    return () => clearInterval(interval);
  }, [selectedChatUser]);

  // Format last sync time
  const formatLastSync = () => {
    if (!lastSync) return "ยังไม่มีการซิงค์ข้อมูล";
    return `ซิงค์ล่าสุด: ${lastSync.toLocaleTimeString()}`;
  };

  // Get backend status text
  const getBackendStatusText = () => {
    const backendText = (() => {
      switch (backendStatus) {
        case 'connected':
          return '🟢 Backend Connected';
        case 'error':
          return '🔴 Backend Error (500)';
        case 'offline':
          return '🟡 Backend Offline';
        default:
          return '⚪ Unknown Status';
      }
    })();

    return backendText;
  };

  // Manual retry function
  const handleManualRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/data`, {
        timeout: 15000, // 15 second timeout for manual retry
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      setData(Array.isArray(response.data) ? response.data : []);
      setBackendStatus('connected');
      setRetryCount(0);
      setLastError(null);
      setLastSync(new Date());
      
      // Show success message

      
    } catch (error) {
      console.error("❌ Manual retry failed:", error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setBackendStatus('offline');
        setLastError({
          status: 'NETWORK',
          message: 'Network connection failed',
          details: 'Unable to connect to backend server. Please check your internet connection and try again.'
        });
      } else if (error.response?.status === 500) {
        setBackendStatus('error');
        setLastError({
          status: error.response.status,
          message: error.response.data?.message || 'Database transaction error',
          details: error.response.data?.error || 'Server is experiencing issues. Please try again later.'
        });
      } else if (error.response?.status === 404) {
        setBackendStatus('error');
        setLastError({
          status: error.response.status,
          message: 'API endpoint not found',
          details: 'The requested API endpoint does not exist. Please contact support.'
        });
      } else {
        setBackendStatus('offline');
        setLastError({
          status: 'ERROR',
          message: error.message || 'Connection failed',
          details: 'Unable to reach the server. Please check your connection and try again.'
        });
      }
    } finally {
      setIsRetrying(false);
    }
  };

  // Export functions using native browser APIs
  const exportToCSV = () => {
    const headers = [
      "Ticket ID", // Added this
      "อีเมล",
      "ชื่อ",
      "เบอร์ติดต่อ",
      "แผนก",
      "วันที่แจ้ง",
      "สถานะ",
      "Appointment",
      "Request",
      "Report",
      "Type",
    ];

    const csvRows = [
      headers.join(","),
      ...filteredData.map((row) =>
        [
          `"${row["Ticket ID"] || ""}"`, // Added this
          `"${row["อีเมล"] || ""}"`,
          `"${row["ชื่อ"] || ""}"`,
          `"${row["เบอร์ติดต่อ"] || ""}"`,
          `"${row["แผนก"] || ""}"`,
          `"${row["วันที่แจ้ง"] || ""}"`,
          `"${row["สถานะ"] || ""}"`,
          `"${row["Appointment"] || ""}"`,
          `"${row["Request"] || ""}"`,
          `"${row["Report"] || ""}"`,
          `"${row["Type"] || "None"}"`,
        ].join(",")
      ),
    ].join("\n");

    const csvBlob = new Blob(["\uFEFF" + csvRows], {
      type: "text/csv;charset=utf-8;",
    });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvLink = document.createElement("a");
    csvLink.setAttribute("href", csvUrl);
    csvLink.setAttribute(
      "download",
      `tickets_${new Date().toISOString().split("T")[0]}.csv`
    );
    csvLink.style.visibility = "hidden";
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);
  };
  const exportToJSON = () => {
    const exportData = filteredData.map((row) => ({
      Ticket_ID: row["Ticket ID"], // Added this
      อีเมล: row["อีเมล"],
      ชื่อ: row["ชื่อ"],
      เบอร์ติดต่อ: row["เบอร์ติดต่อ"],
      แผนก: row["แผนก"],
      วันที่แจ้ง: row["วันที่แจ้ง"],
      สถานะ: row["สถานะ"],
      Appointment: row["Appointment"],
      Request: row["Request"],
      Report: row["Report"],
      Type: row["Type"] || "None",
    }));

    const jsonContent = JSON.stringify(exportData, null, 2);
    const jsonBlob = new Blob([jsonContent], { type: "application/json" });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement("a");
    jsonLink.setAttribute("href", jsonUrl);
    jsonLink.setAttribute(
      "download",
      `tickets_${new Date().toISOString().split("T")[0]}.json`
    );
    jsonLink.style.visibility = "hidden";
    document.body.appendChild(jsonLink);
    jsonLink.click();
    document.body.removeChild(jsonLink);
  };

  // --- Notification Drag Events ---
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // ฟังก์ชันคำนวณข้อมูล dashboard
  const getDailySummary = () => {
    const dailySummary = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailySummary[dateKey] = {
        date: date,
        count: 0,
        New: 0,
        'In Process': 0, // Changed from 'In Progress' to 'In Process'
        Pending: 0,
        Closed: 0,
        Cancelled: 0,
        Reject: 0, // Changed from 'Rejected' to 'Reject'
      };
    }
    data.forEach(ticket => {
      if (!ticket["วันที่แจ้ง"]) return;
      const ticketDate = new Date(ticket["วันที่แจ้ง"]).toISOString().split('T')[0];
      let status = ticket["สถานะ"];
      // Map statuses to match our STATUS_OPTIONS
      if (status === "In Process") status = "In Process";
      if (status === "Rejected") status = "Reject";
      if (status === "Completed" || status === "Complete") status = "Closed";
      
      if (dailySummary[ticketDate]) {
        dailySummary[ticketDate].count++;
        if (dailySummary[ticketDate][status] !== undefined) {
          dailySummary[ticketDate][status]++;
        }
      }
    });
    return Object.values(dailySummary).sort((a, b) => b.date - a.date);
  };
  const getBasicStats = () => {
    const base = {
      New: 0,
      "In Process": 0, // Changed from "In Progress" to "In Process"
      Pending: 0,
      Closed: 0,
      Cancelled: 0,
      Reject: 0, // Changed from "Rejected" to "Reject"
    };
    data.forEach((t) => {
      let s = t.status || t["สถานะ"];
      // Map old status names to new ones if needed
      if (s === "In Process") s = "In Process";
      if (s === "Rejected") s = "Reject";
      if (s === "Completed" || s === "Complete") s = "Closed";
      if (base[s] !== undefined) base[s]++;
    });
    return base;
  };
  

  function parseAppointmentText(str) {
    if (!str) return null;
    
    try {
      // สำหรับรูปแบบ "2025-07-05 15:00-16:00"
      const [datePart, timeRange] = str.split(' ');
      if (!datePart || !timeRange) return null;
      
      const [startTime] = timeRange.split('-');
      const [hours, minutes] = startTime.split(':');
      
      const date = new Date(datePart);
      date.setHours(parseInt(hours), parseInt(minutes));
      
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.error("Error parsing appointment:", error);
      return null;
    }
  }

  const getUpcomingAppointments = () => {
    const now = new Date();
    return data.filter((t) => {
      // ตรวจสอบทั้ง Service และ Helpdesk
      if (t["Type"] !== "Service" && t["Type"] !== "Helpdesk") return false;
      
      // ตรวจสอบสถานะ
      if (t["สถานะ"] !== "New" && t["สถานะ"] !== "Pending") return false;
      
      // ตรวจสอบการนัดหมาย (รองรับหลายรูปแบบ)
      const apptRaw = t["Appointment"] || t["appointment text"] || t["appointment_datetime"];
      if (!apptRaw) return false;

      try {
        // แปลงวันที่จากรูปแบบต่างๆ
        let apptDate;
        if (apptRaw.includes('-')) { // รูปแบบ "2025-07-03 15:00-16:00"
          const [dateStr, timeRange] = apptRaw.split(' ');
          const [startTime] = timeRange.split('-');
          const [hours, minutes] = startTime.split(':');
          apptDate = new Date(dateStr);
          apptDate.setHours(parseInt(hours), parseInt(minutes));
        } else { // รูปแบบอื่นๆ
          apptDate = parseAppointmentText(apptRaw);
        }

        if (!apptDate) return false;

        // ตรวจสอบว่าอยู่ในวันนี้หรือเลยกำหนด
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const isToday = apptDate.toDateString() === today.toDateString();
        const isOverdue = apptDate < now;

        return isToday || isOverdue;
      } catch (error) {
        console.error("Error parsing date:", error);
        return false;
      }
    }).sort((a, b) => {
      // เรียงลำดับตามเวลานัดหมาย
      const getDateTime = (ticket) => {
        const apptRaw = ticket["Appointment"] || ticket["appointment text"] || ticket["appointment_datetime"];
        try {
          if (apptRaw.includes('-')) {
            const [dateStr, timeRange] = apptRaw.split(' ');
            const [startTime] = timeRange.split('-');
            const [hours, minutes] = startTime.split(':');
            const date = new Date(dateStr);
            date.setHours(parseInt(hours), parseInt(minutes));
            return date;
          }
          return new Date(apptRaw);
        } catch {
          return new Date(0);
        }
      };
      return getDateTime(a) - getDateTime(b);
    });
  };

  const getOverdueAppointments = () => {
    const overdueTickets = [];
    const now = new Date();
    data.forEach(ticket => {
      if (!ticket["วันที่แจ้ง"]) return;
      const created = new Date(ticket["วันที่แจ้ง"]);
      const hoursSinceCreation = (now - created) / (1000 * 60 * 60);
      if (ticket["สถานะ"] !== "Completed" && hoursSinceCreation > 48) {
        overdueTickets.push({
          id: ticket["Ticket ID"],
          name: ticket["ชื่อ"],
          department: ticket["แผนก"],
          status: ticket["สถานะ"],
          hoursOverdue: Math.floor(hoursSinceCreation - 48)
        });
      }
    });
    return overdueTickets.sort((a, b) => b.hoursOverdue - a.hoursOverdue);
  };

  // ฟังก์ชันคำนวณอันดับผู้ใช้
  const getUserRankings = () => {
    const userMap = {};
    data.forEach(ticket => {
      // Skip tickets of type "Information"
      const ticketType = ticket["Type"] || "";
      if (ticketType.toLowerCase() === "information") {
        return; // Skip this ticket
      }
      
      const email = ticket["อีเมล"] || "ไม่ระบุอีเมล";
      const name = ticket["ชื่อ"] || "ไม่ระบุชื่อ";
      const userKey = email; // Use email as the unique key
      
      if (!userMap[userKey]) {
        userMap[userKey] = {
          email: email,
          name: name,
          count: 0
        };
      }
      userMap[userKey].count += 1;
      
      // Update name if we find a more complete one (not "ไม่ระบุชื่อ")
      if (name !== "ไม่ระบุชื่อ" && userMap[userKey].name === "ไม่ระบุชื่อ") {
        userMap[userKey].name = name;
      }
    });
    
    const rankings = Object.values(userMap)
      .sort((a, b) => b.count - a.count);
    return rankings;
  };
  // ฟังก์ชันกรองข้อมูลที่จะแสดง (5 อันดับแรกหรือทั้งหมด)
  const getDisplayRankings = () => {
    const rankings = getUserRankings();
    return showAllRankings ? rankings : rankings.slice(0, 5);
  };

// Note: handleEditTicket, handleTypeChange, handleGroupChange, handleSubgroupChange are now defined earlier in the component

  // Handle form field changes
  const handleEditFormChange = (field, value) => {

    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // ฟังก์ชันยกเลิกแก้ไข
  const handleCancelEdit = () => {
    setEditingTicketId(null);
    setEditForm({
      type: "",
      group: "",
      subgroup: "",
      email: "",
      name: "",
      phone: "",
      department: "",
      date: "",
      appointment: "",
      appointment_datetime: "",
      request: "",
      report: "",
      status: "New"
    });
    setEditError("");
    setEditSuccess("");
  };

  // ฟังก์ชันบันทึกการแก้ไข
  const handleSaveEdit = async (ticketId) => {
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");
    
    // Map request and report based on ticket type and selected group for backend compatibility
    const requestField = editForm.type === "Service"
      ? (editForm.group || editForm.request)
      : editForm.type === "Helpdesk"
        ? editForm.request // usually unused
        : (editForm.group || editForm.request);
    const reportField = editForm.type === "Helpdesk" ? (editForm.group || editForm.report) : editForm.report;
    
    try {
      // Build the payload dynamically – include only meaningful, non-empty values
      // Special handling for appointment fields - allow clearing them by sending empty string
      const isValid = (v) => v !== undefined && v !== null && v !== "None";
      const isValidOrEmpty = (v) => v !== undefined && v !== null && v !== "None";

      const payload = {
        ticket_id: ticketId,
        updated_by: authUser?.name || authUser?.pin || "admin",
      };

      // Basic optional fields
      if (isValid(editForm.email)) payload.email = editForm.email;
      if (isValid(editForm.name)) payload.name = editForm.name;
      if (isValid(editForm.phone)) payload.phone = editForm.phone;
      if (isValid(editForm.department)) payload.department = editForm.department;
      if (isValid(editForm.date)) payload.date = editForm.date;
      
      // Special handling for appointment fields - allow empty values to clear them
      if (isValidOrEmpty(editForm.appointment)) payload.appointment = editForm.appointment;
      if (isValidOrEmpty(editForm.appointment_datetime)) payload.appointment_datetime = editForm.appointment_datetime;

      // Request / Report mapping (SERVICE / HELPDESK logic above)
      if (isValid(requestField)) {
        payload.requested = requestField; // new canonical column
        payload.request   = requestField; // legacy fallback
      }
      if (isValid(reportField)) payload.report = reportField;

      // Type, Group, Subgroup, Status
      if (isValid(editForm.type)) payload.type = editForm.type;
      if (isValid(editForm.group)) payload.group = editForm.group;
      
      // Special handling for SERVICE type - subgroup is required
      if (editForm.type === "Service") {
        if (!editForm.subgroup || editForm.subgroup === "") {
          setEditError("Subgroup is required for Service type tickets");
          setEditLoading(false);
          return;
        }
        payload.subgroup = editForm.subgroup;
      } else {
        // For non-Service types, include subgroup only if it has a value
        if (isValid(editForm.subgroup)) payload.subgroup = editForm.subgroup;
      }
      
      if (isValid(editForm.status)) payload.status = editForm.status;
  

      
      const response = await axios.post(
        `${API_BASE_URL}/update-ticket`,
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
  
      if (response.data.success) {
        // Update the local state with the edited ticket
        setData(prevData =>
          prevData.map(item =>
            item["Ticket ID"] === ticketId
              ? {
                  ...item,
                  "อีเมล": editForm.email,
                  "ชื่อ": editForm.name,
                  "เบอร์ติดต่อ": editForm.phone,
                  "แผนก": editForm.department,
                  "วันที่แจ้ง": editForm.date,
                  "Appointment": editForm.appointment,
                  "appointment_datetime": editForm.appointment_datetime,
                  "Requeste": requestField,
                  "requested": requestField,
                  "Requested": requestField,
                  "Report": reportField,
                  "Type": editForm.type,
                  "สถานะ": editForm.status,
                  "Group": editForm.group,
                  "group": editForm.group,
                  "subgroup": editForm.subgroup
                }
              : item
          )
        );
  
        setEditSuccess("บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว");
        
        // Refresh dashboard if appointment was updated to reflect changes
        if (payload.appointment !== undefined || payload.appointment_datetime !== undefined) {

          // Force refresh of dashboard data
          setTimeout(() => {
            fetchData();
          }, 500);
        }
        
        setTimeout(() => {
          setEditingTicketId(null);
          setEditSuccess("");
        }, 2000);
      } else {
        setEditError(response.data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Full error response:", error.response);
      setEditError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์"
      );
    } finally {
      setEditLoading(false);
    }
  };

  // ตรวจจับขนาดหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ฟังก์ชันเปลี่ยน tab สำหรับ mobile
  const handleMobileTabChange = (tab) => {
    setMobileActiveTab(tab);
    setActiveTab(tab);
    
    // ปิด dashboard auto-scroll ชั่วคราวเพื่อแก้ปัญหาหน้าหลักเลื่อนลง
    // if (tab === "dashboard") {
    //   setTimeout(() => {
    //     scrollToDashboard();
    //   }, 50);
    // }
    if (tab === "list") scrollToList();
    if (tab === "chat") scrollToChat();
    if (tab === "logs") navigate("/logs");
    if (tab === "email-alerts") navigate("/email-alerts");
    setSidebarMobileOpen(false);
  };

  // --- ฟังก์ชันเช็คข้อความใหม่และโหลด notifications ---
  const checkForNewMessages = useCallback(async () => {

    try {
      // 1. โหลด notifications ทั้งหมดจาก backend
      const notificationsResponse = await axios.get(`${API_BASE_URL}/api/notifications`, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
      });
      

      
      // 2. เช็คว่ามี notifications ใหม่หรือไม่
      const currentNotifications = notifications;
      const newNotifications = notificationsResponse.data;
      
      // หา notification ใหม่ที่ยังไม่มีใน current state
      const newItems = newNotifications.filter(newItem => 
        !currentNotifications.some(current => current.id === newItem.id)
      );
      
    
      
      // 3. ถ้ามี notification ใหม่ที่เป็น new_message ให้แสดง popup (ทั้งจาก user และ admin)
      const newMessageNotifications = newItems.filter(item => {
        // Parse meta_data if it's a string
        let metaData = item.meta_data;
        if (typeof metaData === 'string') {
          try {
            metaData = JSON.parse(metaData);
          } catch (e) {
            metaData = {};
          }
        }
        
        // ตรวจสอบเงื่อนไขที่อ่อนกว่าเดิม
        const isNewMessage = metaData?.type === 'new_message' || item.type === 'new_message';
        const isUnread = !item.read;
        // แสดง notification สำหรับข้อความจาก user เท่านั้น (ตามที่ user ต้องการ)
        const isFromUser = metaData?.sender_type === 'user';
        
        console.log('🔔 Checking notification item:', {
          id: item.id,
          isNewMessage,
          isUnread,
          isFromUser,
          meta_data: metaData,
          sender_type: metaData?.sender_type
        });
        
        return isNewMessage && isUnread && isFromUser;
      });
      
      
      
      if (newMessageNotifications.length > 0) {
        const latestMsg = newMessageNotifications[0];
        
        
        // Parse meta_data if needed
        let metaData = latestMsg.meta_data;
        if (typeof metaData === 'string') {
          try {
            metaData = JSON.parse(metaData);
          } catch (e) {
            metaData = {};
          }
        }
        
        // หาชื่อจริงจาก ticket data
        let ticketsData = data;
        if (data.length === 0) {
          try {
            const ticketsResponse = await axios.get(`${API_BASE_URL}/api/tickets`, {
              timeout: 3000,
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            ticketsData = ticketsResponse.data;
          } catch (error) {
            ticketsData = [];
          }
        }
        
        // ค้นหา ticket ที่ตรงกับ user_id
        const ticket = ticketsData.find(t => 
          t.user_id === latestMsg.user_id || 
          t.ticket_id === latestMsg.user_id ||
          t.id === latestMsg.user_id ||
          String(t.id) === String(latestMsg.user_id) ||
          t.user_id?.includes(latestMsg.user_id?.substring(0, 10))
        );
        
        // ลองหาชื่อจากหลายแหล่ง
        let displayName = ticket?.name || 
                         ticket?.display_name || 
                         ticket?.email?.split('@')[0] || // ใช้ชื่อจาก email
                         latestMsg.sender_name || 
                         metaData?.sender_name;
        
        // ถ้ายังไม่มีชื่อ หรือชื่อเป็น LINE ID ให้ใช้ชื่อเริ่มต้น
        if (!displayName || (displayName.startsWith('U') && displayName.length > 10)) {
          displayName = `LINE User ${latestMsg.user_id?.substring(0, 8) || 'Unknown'}`;
        }
        
        // แสดง popup notification
        setNewMessageAlert({
          user: displayName,
          message: latestMsg.message,
          timestamp: latestMsg.timestamp,
          user_id: latestMsg.user_id,
          sender_name: displayName
        });
        setLastMessageCheck(new Date(latestMsg.timestamp));
      }
      
      // 4. อัพเดท notifications state
      setNotifications(newNotifications);
      
      // 5. เช็คว่ามี unread notifications หรือไม่
      const hasUnreadNotifications = notificationsResponse.data.some(n => !n.read);

      setHasUnread(hasUnreadNotifications);
      
    } catch (error) {
      console.error("🔔 Error checking notifications:", error);
      // ถ้า API ไม่มี ให้ลองใช้ API เก่า
      if (error.response?.status === 404) {

        try {
          const response = await axios.get(`${API_BASE_URL}/api/check-new-messages`, {
            params: { last_checked: lastMessageCheck.toISOString() }
          });
          if (response.data.new_messages && response.data.new_messages.length > 0) {
            const latestGroup = response.data.new_messages[0];
            const latestMsg = latestGroup.messages[latestGroup.messages.length - 1];
            setNewMessageAlert({
              user: latestGroup.name,
              message: latestMsg.message,
              timestamp: latestMsg.timestamp,
              user_id: latestGroup.user_id,
              sender_name: latestGroup.name
            });
            setLastMessageCheck(new Date(latestMsg.timestamp));
            setHasUnread(true);
          }
        } catch (e) {
          console.error("🔔 Old API also failed:", e);
        }
      }
    }
  }, [lastMessageCheck, notifications, hasUnread, newMessageAlert, data]);
  
  useEffect(() => {
    // เรียกครั้งแรกเมื่อ component mount
    const initializeApp = async () => {

      
      // 1. ดึงข้อความจาก textbox ทุก ticket ก่อน
      try {
        await processAllTextboxMessages();
      } catch (error) {
        console.warn("🚀 Failed to process textbox messages during initialization:", error.message);
      }
      
      // 2. แล้วค่อยเช็ค notifications
      checkForNewMessages();
    };
    
    initializeApp();
    
    // ตั้ง interval ให้เช็คทุก 5 วินาที (ลดเวลาลงเพื่อให้ได้ notification เร็วขึ้น)
    const interval = setInterval(checkForNewMessages, 5000);
    return () => clearInterval(interval);
  }, [checkForNewMessages, processAllTextboxMessages]);

  useEffect(() => {
    if (highlightMsgId && chatMessages.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`msg-${highlightMsgId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.background = '#fef9c3';
          setTimeout(() => { el.style.background = ''; }, 2000);
        }
        setHighlightMsgId(null);
      }, 300);
    }
  }, [highlightMsgId, chatMessages]);

  // ปิด chat auto-scroll ทั้งหมด - เพราะทำให้หน้าหลักเลื่อนลง
  // useEffect(() => {
  //   // เลื่อนเฉพาะเมื่อ chat popup เปิดอยู่ และมี selectedChatUser
  //   if (activeTab === 'chat' && selectedChatUser && selectedChatUser !== "announcement" && messagesEndRef.current && chatMessages.length > 0) {
  //     setTimeout(() => {
  //       if (messagesEndRef.current && activeTab === 'chat' && selectedChatUser) {
  //         messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  //       }
  //     }, 100);
  //   }
  // }, [chatMessages, selectedChatUser, activeTab]);

  // --- เพิ่มฟังก์ชันสำหรับคลิกนัดหมาย ---
  const handleAppointmentClick = (ticketId) => {
    setSearchTerm(ticketId?.toString() || "");
    setActiveTab("list");
    setSelectedTicket(ticketId?.toString() || null);
    // ปิด auto-scroll เพื่อป้องกันหน้าหลักเลื่อนลง
    // setTimeout(() => {
    //   listRef.current?.scrollIntoView({ behavior: "smooth" });
    // }, 100);
  };

  return (
    <PermissionProvider>
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
        <>
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
            />
            <NavItem
              $icon="dashboard"
              $active={activeTab === "dashboard"}
              onClick={() => {
                setActiveTab("dashboard");
                // เลื่อนไปยัง Dashboard เมื่อคลิกเมนู
                setTimeout(() => {
                  scrollToDashboard();
                }, 50);
              }}
              $collapsed={!sidebarOpen}
              data-tooltip="Dashboard"
            >
              <span>📊 Dashboard</span>
            </NavItem>
            <NavItem
              $icon="list"
              $active={activeTab === "list"}
              onClick={() => {
                setActiveTab("list");
                scrollToList();
              }}
              $collapsed={!sidebarOpen}
              data-tooltip="List"
            >
              <span>🎟️ Ticket List</span>
            </NavItem>
            <NavItem
              $icon="chat"
              $active={activeTab === "chat"}
              onClick={() => {
                setActiveTab("chat");
                scrollToChat();
              }}
              $collapsed={!sidebarOpen}
              data-tooltip="Chat"
            >
              <span>💬 Chat</span>
            </NavItem>
            <NavItem
            $icon="history"
            $active={activeTab === "logs" || location.pathname === "/logs"}
            onClick={() => {
              setActiveTab("logs");
              navigate("/logs");
            }}
            $collapsed={!sidebarOpen}
            data-tooltip="Status Logs"
          >
            <span>📈 Status Logs</span>
          </NavItem>
          <NavItem
            $icon="email"
            $active={activeTab === "email-alerts" || location.pathname === "/email-alerts"}
            onClick={() => {
              setActiveTab("email-alerts");
              navigate("/email-alerts");
            }}
            $collapsed={!sidebarOpen}
            data-tooltip="Email Alerts"
          >
            <span>📧 Email Alerts</span>
          </NavItem>
          <NavItem
              $icon="admin"
              $active={activeTab === "admin-type-group" || location.pathname === "/admin-type-group"}
              onClick={() => {
                setActiveTab("admin-type-group");
                navigate("/admin-type-group");
              }}
              $collapsed={!sidebarOpen}
              data-tooltip="Admin Type/Group"
            >
              <span>⚙️ จัดการ Type/Group</span>
            </NavItem>
          </Sidebar>
          {/* Mobile Bottom Navigation */}
          {isMobile && (
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'white',
              display: 'flex',
              justifyContent: 'space-around',
              padding: '12px 0',
              boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
              zIndex: 1000
            }}>
              <MobileNavItemBar 
                onClick={() => handleMobileTabChange("dashboard")}
                $active={mobileActiveTab === "dashboard"}
              >
                Dashboard
              </MobileNavItemBar>
              <MobileNavItemBar 
                onClick={() => handleMobileTabChange("list")}
                $active={mobileActiveTab === "list"}
              >
                Tickets
              </MobileNavItemBar>
              <MobileNavItemBar 
                onClick={() => handleMobileTabChange("chat")}
                $active={mobileActiveTab === "chat"}
              >
                Chat
              </MobileNavItemBar>
              <MobileNavItemBar 
                onClick={() => handleMobileTabChange("logs")}
                $active={mobileActiveTab === "logs"}
              >
                Logs
              </MobileNavItemBar>
              <MobileNavItemBar 
                onClick={() => {
                  setActiveTab("email-alerts");
                  navigate("/email-alerts");
                }}
                $active={activeTab === "email-alerts"}
              >
                📧 Email
              </MobileNavItemBar>
            </div>
          )}

          
          <MainContent style={{ marginLeft: sidebarOpen && !isMobile ? '250px' : '0', transition: 'margin-left 0.3s ease' }}>
            {isUpdatingStatus && (
              <LoadingIndicator>
                <span className="loading-icon">⚡</span>
                <span>กำลังอัพเดทสถานะ...</span>
                <span className="ticket-info">
                  Ticket ID: {tempTicketId} • {tempNewStatus}
                </span>
              </LoadingIndicator>
            )}
            <Container>
              <div ref={dashboardRef}>
                <Title>Ticket Management System</Title>
                <DashboardSection
                  stats={(() => {
                    // คำนวณ stats พื้นฐาน - ต้องมีทุก field ที่ DashboardSection คาดหวัง
                    const stats = {
                      New: 0,
                      "In Process": 0,
                      Pending: 0,
                      Closed: 0,
                      "Daily Closed": 0,
                      Cancelled: 0,
                      Reject: 0
                    };
                    
                    // นับจำนวนตามสถานะ
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    data.forEach(item => {
                      const status = item["สถานะ"];
                      // นับเฉพาะสถานะที่มีจริงๆ ไม่เปลี่ยน None เป็น New
                      if (status === "New") {
                        stats.New++;
                      }
                      else if (status === "Pending") {
                        stats.Pending++;
                      }
                      else if (status === "In Process") {
                        stats["In Process"]++;
                      }
                      else if (status === "Closed") {
                        stats.Closed++;
                        
                        // นับ Daily Closed - tickets ที่ถูก close วันนี้
                        const closedDate = item["วันที่แจ้ง"];
                        if (closedDate && status === "Closed") {
                          const ticketDate = new Date(closedDate);
                          ticketDate.setHours(0, 0, 0, 0);
                          if (ticketDate.getTime() === today.getTime()) {
                            stats["Daily Closed"]++;
                          }
                        }
                      }
                      else if (status === "Cancelled") {
                        stats.Cancelled++;
                      }
                      else if (status === "Reject") {
                        stats.Reject++;
                      }
                    });
                    
                    return stats;
                  })()}
                  daily={(() => {
                    // สร้าง daily summary
                    const dailyData = {};
                    const last7Days = [];
                    const today = new Date();
                    
                    // สร้างรายการ 7 วันย้อนหลัง
                    for (let i = 6; i >= 0; i--) {
                      const date = new Date();
                      date.setDate(today.getDate() - i);
                      // ใช้ format MM/DD แทน
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      const dateStr = `${day}/${month}`;
                      last7Days.push(dateStr);
                      dailyData[dateStr] = {
                        New: 0,
                        "In Process": 0,
                        Pending: 0,
                        Closed: 0
                      };
                    }
                    
                    // นับจำนวนตามวันที่
                    data.forEach(item => {
                      const createdAt = item["วันที่แจ้ง"] || item.created_at;
                      if (createdAt) {
                        const date = new Date(createdAt);
                        // ใช้ format เดียวกับที่สร้าง dailyData
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const dateStr = `${day}/${month}`;
                        
                        if (dailyData[dateStr]) {
                          const status = item["สถานะ"] || item.status;
                          if (status === "New") dailyData[dateStr].New++;
                          else if (status === "In Process") dailyData[dateStr]["In Process"]++;
                          else if (status === "Pending") dailyData[dateStr].Pending++;
                          else if (status === "Closed") dailyData[dateStr].Closed++;
                        }
                      }
                    });
                    
                    return dailyData;
                  })()}
                  upcoming={(() => {
                    // รายการนัดหมายที่กำลังจะมาถึง
                    const upcoming = [];
                    const now = new Date();
                    
                    data.forEach(item => {
                      const appointment = item.Appointment || item.appointment || item.appointment_datetime;
                      if (appointment && appointment !== "N/A" && appointment !== "") {
                        const appointmentDate = new Date(appointment);
                        if (appointmentDate > now) {
                          upcoming.push({
                            ticketId: item["Ticket ID"],
                            name: item["ชื่อ"] || item.name,
                            date: appointmentDate,
                            status: item["สถานะ"] || item.status
                          });
                        }
                      }
                    });
                    
                    // เรียงลำดับตามวันที่
                    upcoming.sort((a, b) => a.date - b.date);
                    
                    // คืนค่าแค่ 5 รายการแรก
                    return upcoming.slice(0, 5);
                  })()}
                  overdue={(() => {
                    // รายการที่ค้างนาน
                    const overdue = [];
                    const now = new Date();
                    const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
                    
                    data.forEach(item => {
                      const status = item["สถานะ"] || item.status;
                      if (status === "New" || status === "Pending") {
                        const createdAt = new Date(item["วันที่แจ้ง"] || item.created_at);
                        if (createdAt < threeDaysAgo) {
                          const daysOverdue = Math.floor((now - createdAt) / (24 * 60 * 60 * 1000));
                          overdue.push({
                            ticketId: item["Ticket ID"],
                            name: item["ชื่อ"] || item.name,
                            daysOverdue: daysOverdue,
                            status: status
                          });
                        }
                      }
                    });
                    
                    // เรียงลำดับตามจำนวนวันที่ค้าง (มากไปน้อย)
                    overdue.sort((a, b) => b.daysOverdue - a.daysOverdue);
                    
                    // คืนค่าแค่ 5 รายการแรก
                    return overdue.slice(0, 5);
                  })()}
                  onAppointmentClick={handleAppointmentClick}
                />
                <SyncIndicator>{formatLastSync()}</SyncIndicator>
                <BackendStatusIndicator $status={backendStatus}>
                  {getBackendStatusText()}
                  {(backendStatus === 'error' || backendStatus === 'offline') && (
                    <RetryButton 
                      onClick={handleManualRetry} 
                      disabled={isRetrying}
                    >
                      {isRetrying ? 'Retrying...' : 'Retry'}
                    </RetryButton>
                  )}
                </BackendStatusIndicator>
                {backendStatus === 'offline' && (
                  <div style={{
                    textAlign: 'center',
                    color: '#f59e0b',
                    fontSize: '0.875rem',
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(245, 158, 11, 0.2)'
                  }}>
                    <strong>⚠️ Backend Server Offline</strong><br />
                    The backend server is currently unavailable. Some features may not work properly.
                    {retryCount > 0 && (
                      <div style={{ marginTop: '8px', fontSize: '0.8rem' }}>
                        Auto-retry attempts: {retryCount}
                      </div>
                    )}
                  </div>
                )}
                {backendStatus === 'error' && (
                  <div style={{
                    textAlign: 'center',
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}>
                    <strong>🔴 Backend Server Error</strong><br />
                    The backend server is experiencing issues. Please try again later.
                  </div>
                )}
                {lastError && (
                  <ErrorDetails>
                    <div className="error-header">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z"/>
                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                      </svg>
                      <span>Error Details</span>
                    </div>
                    <div className="error-content">
                      <div className="error-item">
                        <span className="error-label">Status:</span>
                        <span className="error-value">{lastError.status}</span>
                      </div>
                      <div className="error-item">
                        <span className="error-label">Message:</span>
                        <span className="error-value">{lastError.message}</span>
                      </div>
                      <div className="error-item">
                        <span className="error-label">Details:</span>
                        <span className="error-value">{lastError.details}</span>
                      </div>
                      {retryCount > 0 && (
                        <div className="retry-info">
                          <span className="error-label">Retry attempts:</span>
                          <span className="error-value">{retryCount}</span>
                        </div>
                      )}
                    </div>
                  </ErrorDetails>
                )}
                <HeaderSection>
                <UserInfo>
                <div>
                  <strong>{user?.username || user?.name || 'Admin'}</strong> ({user?.role || 'User'})
                </div>
                <LogoutButton onClick={logout}>
                  ออกจากระบบ
                </LogoutButton>
              </UserInfo>
                  <div></div>
                  <ExportSection>
                    <NotificationBell
                      $hasUnread={hasUnread}
                      onClick={() => {
                        setShowNotifications(!showNotifications);
                        if (hasUnread && !showNotifications) {
                          markAsRead();
                        }
                      }}
                    />
                    <ExportButton 
                      onClick={fetchData}
                      disabled={loading}
                      style={{ 
                        background: loading ? '#e2e8f0' : 'rgba(255, 255, 255, 0.9)',
                        color: loading ? '#94a3b8' : '#475569'
                      }}
                    >
                      {loading ? 'กำลังโหลด...' : '🔄 รีเฟรช'}
                    </ExportButton>
                    <ExportButton onClick={exportToCSV}>ส่งออก CSV</ExportButton>
                    <ExportButton $primary onClick={exportToJSON}>
                      ส่งออก JSON
                    </ExportButton>
                  </ExportSection>
                </HeaderSection>
                {/* Dashboard */}
                <Dashboard>
                  {/* 1. สรุปภาพรวม ticket รายวัน */}
  

                  

                  
                  

                  {/* 4. สถิติอื่นๆ ที่มีอยู่เดิม */}
                  <StatCard $accent="linear-gradient(90deg, #ec4899, #f43f5e)">
                    <StatTitle>ประเภทของ Ticket</StatTitle>
                    <div style={{ marginTop: "16px" }}>
                      {Object.entries(
                        data.reduce((acc, ticket) => {
                          const type = ticket["Type"] || "None";
                          acc[type] = (acc[type] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([type, count]) => (
                        <div
                          key={type}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <span>{type}</span>
                          <span style={{ fontWeight: "600" }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </StatCard>

                  {/* 5. อันดับผู้ใช้ Ticket มากที่สุด */}
                  <RankingCard $accent="linear-gradient(90deg, #8b5cf6, #7c3aed)">
                    <RankingHeader>
                      <StatTitle>อันดับผู้ใช้ Ticket มากที่สุด</StatTitle>
                      <RankingToggleButton onClick={() => setShowAllRankings(!showAllRankings)}>
                        {showAllRankings ? (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 15l7-7 7 7" /></svg>
                            แสดงเฉพาะ 5 อันดับแรก
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 9l-7 7-7-7" /></svg>
                            แสดงทั้งหมด
                          </>
                        )}
                      </RankingToggleButton>
                    </RankingHeader>
                    <UserRankingList>
                      {getDisplayRankings().map((user, index) => (
                        <UserRankingItem key={user.email}>
                          <UserRankingInfo>
                            <UserRankBadge $rank={index + 1}>{index + 1}</UserRankBadge>
                            <UserRankingEmail
                              title={user.email}
                              onClick={() => {
                                setSearchTerm(user.email);
                                setActiveTab("list");
                                scrollToList();
                              }}
                            >
                              <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                                {user.name !== 'ไม่ระบุชื่อ' ? user.name : 'ไม่ระบุชื่อ'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {user.email}
                              </div>
                            </UserRankingEmail>
                          </UserRankingInfo>
                          <UserTicketCount>{user.count} Tickets</UserTicketCount>
                        </UserRankingItem>
                      ))}
                      {getUserRankings().length === 0 && (
                        <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                          ไม่มีข้อมูลผู้ใช้
                        </div>
                      )}
                    </UserRankingList>
                    {!showAllRankings && getUserRankings().length > 5 && (
                      <div style={{
                        textAlign: 'center',
                        color: '#64748b',
                        fontSize: '0.75rem',
                        marginTop: '8px'
                      }}>
                        + อีก {getUserRankings().length - 5} รายการ
                      </div>
                    )}
                  </RankingCard>
                </Dashboard>
              </div>
              <div ref={listRef}>
              <StatCard
  $accent="linear-gradient(90deg, #3b82f6, #2563eb)"
  style={{ gridColumn: "span 2" }}
>
  <StatTitle>นัดหมายล่าสุด (Service)</StatTitle>
  <div style={{ marginTop: "16px" }}>
    {(() => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const filtered = data.filter((ticket) => {
        if (ticket["Type"] !== "Service") return false;
        if (ticket["สถานะ"] !== "New" && ticket["สถานะ"] !== "Pending") return false;
        if (!ticket["Appointment"]) return false;

        try {
          const [dateStr, timeRange] = (ticket["Appointment"] || "").split(' ');
          if (!dateStr || !timeRange) return false;
          const [startTime] = timeRange.split('-');
          if (!startTime) return false;
          const [hours, minutes] = startTime.split(':');
          if (!hours || !minutes) return false;

          const apptDate = new Date(dateStr);
          apptDate.setHours(parseInt(hours), parseInt(minutes));

          if (isNaN(apptDate.getTime())) return false;

          const isToday = apptDate.toDateString() === today.toDateString();
          const isOverdue = apptDate < now;

          // แก้ตรงนี้: ให้แสดงทั้งวันนี้และเลยเวลา (รวมถึงเลยวัน)
          return isToday || isOverdue;
        } catch (error) {
          return false;
        }
      });

      const sorted = filtered.sort((a, b) => {
        const getDateTime = (str) => {
          const [dateStr, timeRange] = (str || "").split(' ');
          if (!dateStr || !timeRange) return 0;
          const [startTime] = timeRange.split('-');
          if (!startTime) return 0;
          const [hours, minutes] = startTime.split(':');
          if (!hours || !minutes) return 0;
          const date = new Date(dateStr);
          date.setHours(parseInt(hours), parseInt(minutes));
          return date;
        };
        return getDateTime(a["Appointment"]) - getDateTime(b["Appointment"]);
      });

      if (sorted.length === 0) {
        return (
          <div style={{ 
            textAlign: 'center', 
            color: '#64748b', 
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '8px'
          }}>
            ไม่พบการนัดหมาย
          </div>
        );
      }

      return sorted.map((ticket) => {
        const [dateStr, timeRange] = (ticket["Appointment"] || "").split(' ');
        const [startTime] = (timeRange || '').split('-');
        const [hours, minutes] = (startTime || '').split(':');
        const apptDate = new Date(dateStr);
        if (hours && minutes) apptDate.setHours(parseInt(hours), parseInt(minutes));

        const isOverdue = apptDate < now;
        const isToday = apptDate.toDateString() === today.toDateString();
        const isPending = ticket["สถานะ"] === "Pending";

        const colors = isPending ? {
          bg: isOverdue ? "#fff1f2" : "#f0f9ff",
          border: isOverdue ? "#fb7185" : "#38bdf8",
          text: isOverdue ? "#e11d48" : "#0284c7"
        } : {
          bg: isOverdue ? "#fee2e2" : "#fef9c3",
          border: isOverdue ? "#ef4444" : "#f59e0b",
          text: isOverdue ? "#ef4444" : "#d97706"
        };

        return (
          <div
            key={ticket["Ticket ID"]}
            style={{
              marginBottom: "12px",
              padding: "12px",
              background: colors.bg,
              borderRadius: "8px",
              borderLeft: `4px solid ${colors.border}`,
              animation: isOverdue ? "blink 1s linear infinite" : "none",
              cursor: 'pointer',
            }}
            onClick={() => handleAppointmentClick(ticket["Ticket ID"])}
          >
            <div style={{ fontWeight: "600", display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div>
                <div>{ticket["ชื่อ"] || "ไม่ระบุชื่อ"} (Ticket ID: {ticket["Ticket ID"]})</div>
                <div style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 'normal' }}>
                  ผู้แจ้ง: {ticket["Requested"] || ticket["Requeste"] || "ไม่ระบุผู้แจ้ง"}
                </div>
              </div>
              {isOverdue && (
                <span style={{ 
                  color: colors.text,
                  fontWeight: 600,
                  background: `${colors.bg}dd`,
                  padding: "2px 8px",
                  borderRadius: "4px"
                }}>
                  เลยกำหนด
                </span>
              )}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#475569", margin: '4px 0' }}>
              <div style={{ marginBottom: '4px' }}>
                <span style={{ fontWeight: 500 }}>วันที่แจ้ง:</span>{' '}
                {ticket["วันที่แจ้ง"]}
              </div>
              <div>
                <span style={{ fontWeight: 500 }}>นัดหมาย:</span>{' '}
                {ticket["Appointment"]}
              </div>
            </div>
            <div style={{
              fontSize: "0.75rem",
              color: "#64748b",
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>
                {ticket["แผนก"] || "ไม่ระบุแผนก"} • 
                <span style={{
                  display: 'inline-block',
                  padding: "2px 8px",
                  borderRadius: "4px",
                  backgroundColor: colors.bg,
                  color: colors.text,
                  marginLeft: "4px",
                  fontWeight: 500
                }}>
                  {ticket["สถานะ"]}
                </span>
              </span>
              {isToday && !isOverdue && (
                <span style={{ 
                  background: colors.bg,
                  color: colors.text,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  fontWeight: 500
                }}>
                  วันนี้
                </span>
              )}
            </div>
          </div>
        );
      });
    })()}
  </div>
</StatCard>
                <TableContainer>
                  <TableTitle>รายการ Ticket ทั้งหมด</TableTitle>

                  {/* Search and Filter Section */}
                  <SearchAndFilterContainer>
                    <SearchInput
                      type="text"
                      placeholder="ค้นหาID/mail/name/แผนก/เบอร์"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {/* Enhanced Date and Time Range Filter */}
                    <DateFilterContainer>
                      <DateTimeGroup>
                        <DateTimeLabel>วันที่เริ่มต้น:</DateTimeLabel>
                        <DateInput
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          placeholder="วันที่เริ่มต้น"
                        />
                        <TimeInput
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          placeholder="เวลาเริ่มต้น"
                        />
                      </DateTimeGroup>
                      
                      <DateTimeGroup>
                        <DateTimeLabel>วันที่สิ้นสุด:</DateTimeLabel>
                        <DateInput
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          placeholder="วันที่สิ้นสุด"
                        />
                        <TimeInput
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          placeholder="เวลาสิ้นสุด"
                        />
                      </DateTimeGroup>
                      
                      <DateTimeGroup>
                        <FilterButton onClick={fetchDataByDateRange} disabled={!startDate && !endDate}>
                          🔍 กรองข้อมูล
                        </FilterButton>
                        <ResetButton onClick={resetDateFilter}>🔄 รีเซ็ต</ResetButton>
                      </DateTimeGroup>
                      
                      
                       
                      
                    </DateFilterContainer>

                    <FilterGroup>
                      <FilterLabel>สถานะ:</FilterLabel>
                      <FilterSelect
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">ทั้งหมด</option>
                        <option value="New">New</option>
                        <option value="In Process">In Process</option>
                        <option value="Pending">Pending</option>
                        <option value="Closed">Closed</option>
                        <option value="Cancelled">Canclled</option>
                        <option value="Reject">Reject</option>
                        
                      </FilterSelect>
                    </FilterGroup>

                    <FilterGroup>
                      <FilterLabel>ประเภท:</FilterLabel>
                      <FilterSelect
                        value={typeFilter}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTypeFilter(val === "all" ? "all" : val.toUpperCase());
                        }}
                      >
                        <option value="all">ทั้งหมด</option>
                        {uniqueTypes.map((type) => (
                          <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>
                        ))}
                      </FilterSelect>
                    </FilterGroup>
                  </SearchAndFilterContainer>

                  {/* Date Filter Status Display */}
                  {isDateFilterActive && startDate && endDate && (
                    <div style={{
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      margin: '16px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📅</span>
                        <span style={{ fontWeight: '500' }}>
                          กำลังแสดงข้อมูล: จาก {new Date(startDate).toLocaleDateString('th-TH')} ถึง {new Date(endDate).toLocaleDateString('th-TH')}
                        </span>
                        <span style={{ 
                          background: 'rgba(255,255,255,0.2)', 
                          padding: '4px 8px', 
                          borderRadius: '6px',
                          fontSize: '0.875rem'
                        }}>
                          {filteredData.length} รายการ
                        </span>
                      </div>
                      <button
                        onClick={resetDateFilter}
                        style={{
                          background: 'rgba(255,255,255,0.2)',
                          border: 'none',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                      >
                        ✕ ยกเลิกการกรอง
                      </button>
                    </div>
                  )}

                  <ScrollContainer>
                    <StyledTable>
                      <TableHeader>
                        <tr>
                          <TableHeaderCell>Ticket ID</TableHeaderCell>
                          <TableHeaderCell>อีเมล</TableHeaderCell>
                          <TableHeaderCell>ชื่อ</TableHeaderCell>
                          <TableHeaderCell>เบอร์ติดต่อ</TableHeaderCell>
                          <TableHeaderCell>แผนก</TableHeaderCell>
                          <TableHeaderCell>วันที่แจ้ง</TableHeaderCell>
                          <TableHeaderCell>สถานะ</TableHeaderCell>
                          <TableHeaderCell>Appointment</TableHeaderCell>
                          
                          
                          <TableHeaderCell>Type</TableHeaderCell>
                          <TableHeaderCell>Group</TableHeaderCell>  
                          <TableHeaderCell>Subgroup</TableHeaderCell>
                          <TableHeaderCell>Action</TableHeaderCell>
                        </tr>
                      </TableHeader>
                      <tbody>
                        {paginatedData.map((row, i) => {
                          const rowColor = getRowColor(
                            row["วันที่แจ้ง"],
                            row["สถานะ"]
                          );
                          const isEditing = editingTicketId === row["Ticket ID"];
                          // appointment_datetime logic
                          const apptText = row["Appointment"] || "";
  row["appointment_datetime"] 
    ? new Date(row["appointment_datetime"])
    : parseAppointmentText(apptText);
                          let apptSoon = false, apptNow = false;
                          if (row["appointment_datetime"]) {
                            const now = new Date();
                            const appt = new Date(row["appointment_datetime"]);
                            const diff = appt - now;
                            if (diff > 0 && diff < 60 * 60 * 1000) apptSoon = true; // ภายใน 1 ชม.
                            if (Math.abs(diff) < 5 * 60 * 1000) apptNow = true; // ถึงแล้ว (±5นาที)
                          }
                          const RowComponent = apptNow ? BlinkingRow : TableRow;
                          return (
                            <RowComponent
                              key={`${row["Ticket ID"]}-${row["สถานะ"]}-${row.last_updated || ''}`}
                              $bgColor={apptSoon && !apptNow ? '#fef9c3' : rowColor}
                              $isSelected={selectedTicket === row["Ticket ID"]}
                            >
                              <TableCell>{row["Ticket ID"] || "None"}</TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <EditInput type="text" value={editForm.email} onChange={e => handleEditFormChange("email", e.target.value)} disabled={editLoading} />
                                ) : (row["อีเมล"] || "None")}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <EditInput type="text" value={editForm.name} onChange={e => handleEditFormChange("name", e.target.value)} disabled={editLoading} />
                                ) : (row["ชื่อ"] || "None")}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <EditInput type="text" value={editForm.phone} onChange={e => handleEditFormChange("phone", e.target.value)} disabled={editLoading} />
                                ) : (
                                  row["เบอร์ติดต่อ"] || 
                                  row["เบอร์โทร"] || 
                                  row["Phone"] || 
                                  row["phone"] || 
                                  row["PHONE"] || 
                                  row["เบอร์"] || 
                                  "None"
                                )}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <EditInput type="text" value={editForm.department} onChange={e => handleEditFormChange("department", e.target.value)} disabled={editLoading} />
                                ) : (row["แผนก"] || "None")}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <EditInput type="text" value={editForm.date} onChange={e => handleEditFormChange("date", e.target.value)} disabled={editLoading} />
                                ) : (row["วันที่แจ้ง"] || "None")}
                              </TableCell>
                              <StatusCell>
                                {isEditing ? (
                                  <StatusSelect
                                  value={editForm.status}
                                  onChange={e => {
                                    const newStatus = e.target.value;
                                    // อัพเดท local state ทันที
                                    setEditForm(prev => ({ ...prev, status: newStatus }));
                                    // เปิด modal สำหรับกรอกหมายเหตุ
                                    if (editForm.status !== newStatus) {
                                      handleStatusChangeWithNote(row["Ticket ID"], newStatus);
                                    }
                                  }}
                                  disabled={editLoading}
                                >
                                  {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                      {`${opt.icon ? opt.icon + ' ' : ''}${opt.label}`}
                                    </option>
                                  ))}
                                </StatusSelect>
                                ) : (
                                  (() => {
                                    const status = row["สถานะ"] === "Completed" || row["สถานะ"] === "Complete" ? "Closed" : row["สถานะ"] || "None";
                                    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
                                    return (
                                      <div
                                         key={`status-${row["Ticket ID"]}-${row["สถานะ"]}`}
                                         className="status-badge"
                                         data-status={status}
                                      >
                                        {statusOption?.icon || '📌'} {status}
                                      </div>
                                    );
                                  })()
                                )}
                              </StatusCell>
                              <TableCell $isEditing={isEditing}>
                                {isEditing ? (
                                  <>
                                    <EditInput
                                      type="text"
                                      value={editForm.appointment}
                                      onChange={e => handleEditFormChange("appointment", e.target.value)}
                                      disabled={editLoading}
                                      placeholder="ข้อความนัดหมาย (เช่น 1 ก.ค. 2025 15:00-16:00)"
                                    />

                                  </>
                                ) : (
                                  <>
                                     {/* Simple Appointment field display - show exact backend data */}
                                     {(() => {
                                       const appointmentValue = row["Appointment"];
                                       const appointmentText = row["appointment text"] || row["appointment_text"];
                                       const appointmentDateTime = row["appointment_datetime"];
                                       
                                       // Priority order: appointment_text > Appointment > appointment_datetime
                                       let displayValue = null;
                                       
                                       if (appointmentText && appointmentText !== "None" && appointmentText !== "null" && appointmentText.trim() !== "") {
                                         displayValue = appointmentText;
                                       } else if (appointmentValue && appointmentValue !== "None" && appointmentValue !== "null" && appointmentValue.trim() !== "") {
                                         displayValue = appointmentValue;
                                       } else if (appointmentDateTime && appointmentDateTime !== "None" && appointmentDateTime !== "null" && appointmentDateTime.trim() !== "") {
                                         displayValue = appointmentDateTime;
                                       }
                                       
                                       // Show the value as-is from backend, or empty if no value
                                       return displayValue || "";
                                     })()} 
                                    {row["appointment_datetime"] && (
                                      <div style={{ fontSize: '0.85em', color: '#64748b' }}>
                                        ({formatDate.thaiDateTimeShort(row["appointment_datetime"])})
                                      </div>
                                    )}
                                  </>
                                )}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <select
                                    value={editForm.type || ""}
                                    onChange={handleTypeChange}
                                    disabled={editLoading}
                                    style={{
                                      padding: '6px 12px',
                                      borderRadius: '8px',
                                      border: '1px solid #e2e8f0',
                                      fontSize: '0.85rem',
                                      background: '#fff',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <option value="">-- Select Type --</option>
                                    {(() => {
                                      const keys = Object.keys(typeGroupMapping);
                                      return keys.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                      ));
                                    })()}
                                  </select>
                                ) : (row["Type"] || "None")}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <select
                                    value={editForm.group}
                                    onChange={handleGroupChange}
                                    disabled={editLoading || !editForm.type}
                                    style={{
                                      padding: '6px 12px',
                                      borderRadius: '8px',
                                      border: '1px solid #e2e8f0',
                                      fontSize: '0.85rem',
                                      background: editForm.type ? '#fff' : '#f1f5f9',
                                      cursor: editForm.type ? 'pointer' : 'not-allowed',
                                    }}
                                  >
                                    <option value="">-- Select Group --</option>
                                     {(() => {
                                        return availableGroups.map(g => (
                                          <option key={g} value={g}>{g}</option>
                                        ));
                                      })()}
                                  </select>
                                ) : (
                                  (() => {
                                      const typeUpper = (row["Type"] || "").toString().toUpperCase();
                                      const groupVal = typeUpper === "SERVICE"
        ? (row["requested"] || row["Requested"] || row["Requeste"] || row["request"] || "")
        : typeUpper === "HELPDESK"
        ? (row["Report"] || "")
        : (row["Group"] || row["group"] || row["requested"] || row["Requested"] || row["Report"] || row["request"] || row["Request"] || "");
                                      if (!groupVal || groupVal === "None" || groupVal === "null" || groupVal === "NULL") {
                                        return "";
                                      }
                                      return groupVal;
                                    })()
                                )}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <select
                                    value={editForm.subgroup}
                                    onChange={handleSubgroupChange}
                                    disabled={editLoading || !editForm.group}
                                    style={{
                                      padding: '6px 12px',
                                      borderRadius: '8px',
                                      border: '1px solid #e2e8f0',
                                      fontSize: '0.85rem',
                                      background: editForm.group ? '#fff' : '#f1f5f9',
                                      cursor: editForm.group ? 'pointer' : 'not-allowed',
                                    }}
                                  >
                                    <option value="">-- Select Subgroup --</option>
                                    {(() => {
                                       return availableSubgroups.map(sg => (
                                         <option key={sg} value={sg}>{sg}</option>
                                       ));
                                     })()}
                                  </select>
                                ) : (row["Subgroup"] || "None")}
                              </TableCell>
                              <TableCell $isEditing={isEditing}>
                                {isEditing ? (
                                  <ActionButtonGroup>
                                    <SaveButton onClick={() => handleSaveEdit(row["Ticket ID"])} disabled={editLoading}>Save</SaveButton>
                                    <CancelButton onClick={handleCancelEdit} disabled={editLoading}>Cancel</CancelButton>
                                  </ActionButtonGroup>
                                ) : (
                                  <ActionButtonGroup>
                                    <EditButton onClick={() => handleEditTicket(row)}>Edit</EditButton>
                                    <DeleteButton onClick={() => handleDeleteTicket(row["Ticket ID"])}>ลบ</DeleteButton>
                                  </ActionButtonGroup>
                                )}
                              </TableCell>
                            </RowComponent>
                          );
                        })}
                      </tbody>
                    </StyledTable>
                  </ScrollContainer>

                  {/* Enhanced Pagination UI with Page Count */}
                  {totalPages > 1 && (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      margin: '16px 0', 
                      gap: '12px'
                    }}>
                      {/* Page Count Info */}
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#64748b',
                        fontWeight: '500',
                        background: 'rgba(100, 116, 139, 0.1)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid rgba(100, 116, 139, 0.2)'
                      }}>
                        📄 หน้า {currentPage} จาก {totalPages} หน้า
                      </div>
                      
                      {/* Pagination Controls */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                          onClick={() => handlePageChange(currentPage - 1)} 
                          disabled={currentPage === 1}
                          style={{ 
                            padding: '8px 16px', 
                            background: currentPage === 1 ? '#e2e8f0' : '#64748b',
                            color: currentPage === 1 ? '#94a3b8' : 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          ← ก่อนหน้า
                        </button>
                        
                        {/* Smart pagination - show limited page numbers for better UX */}
                        {(() => {
                          const maxVisiblePages = 5;
                          let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                          let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                          
                          if (endPage - startPage + 1 < maxVisiblePages) {
                            startPage = Math.max(1, endPage - maxVisiblePages + 1);
                          }
                          
                          const pages = [];
                          
                          // First page
                          if (startPage > 1) {
                            pages.push(
                              <button
                                key={1}
                                onClick={() => handlePageChange(1)}
                                style={{
                                  padding: '8px 12px',
                                  background: 'white',
                                  color: '#64748b',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  minWidth: '40px',
                                  fontSize: '0.875rem'
                                }}
                              >
                                1
                              </button>
                            );
                            if (startPage > 2) {
                              pages.push(
                                <span key="ellipsis1" style={{ color: '#94a3b8', padding: '0 4px' }}>...</span>
                              );
                            }
                          }
                          
                          // Visible pages
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <button
                                key={i}
                                onClick={() => handlePageChange(i)}
                                style={{
                                  padding: '8px 12px',
                                  background: currentPage === i ? '#64748b' : 'white',
                                  color: currentPage === i ? 'white' : '#64748b',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  minWidth: '40px',
                                  fontSize: '0.875rem',
                                  fontWeight: currentPage === i ? '600' : '500'
                                }}
                              >
                                {i}
                              </button>
                            );
                          }
                          
                          // Last page
                          if (endPage < totalPages) {
                            if (endPage < totalPages - 1) {
                              pages.push(
                                <span key="ellipsis2" style={{ color: '#94a3b8', padding: '0 4px' }}>...</span>
                              );
                            }
                            pages.push(
                              <button
                                key={totalPages}
                                onClick={() => handlePageChange(totalPages)}
                                style={{
                                  padding: '8px 12px',
                                  background: 'white',
                                  color: '#64748b',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  minWidth: '40px',
                                  fontSize: '0.875rem'
                                }}
                              >
                                {totalPages}
                              </button>
                            );
                          }
                          
                          return pages;
                        })()}
                        
                        <button 
                          onClick={() => handlePageChange(currentPage + 1)} 
                          disabled={currentPage === totalPages}
                          style={{ 
                            padding: '8px 16px', 
                            background: currentPage === totalPages ? '#e2e8f0' : '#64748b',
                            color: currentPage === totalPages ? '#94a3b8' : 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          ถัดไป →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Loading indicator */}
                  {loading && (
                    <div style={{ textAlign: 'center', margin: '16px', color: '#64748b', fontSize: '0.95rem' }}>
                      กำลังโหลดข้อมูล...
                    </div>
                  )}
                </TableContainer>

                {/* Modal สำหรับเปลี่ยนสถานะ */}
                {showStatusChangeModal && (
                  <StatusChangeModal>
                    <ModalContent>
                      <ModalTitle>เปลี่ยนสถานะเป็น: {tempNewStatus}</ModalTitle>
                      
                      <div>
                        <Label>
                          หมายเหตุ (แสดงในแจ้งเตือน):
                          <SubLabel>ข้อความนี้จะแสดงในแจ้งเตือนให้ผู้ใช้ทราบ</SubLabel>
                        </Label>
                        <NoteTextarea
                          value={statusChangeNote}
                          onChange={(e) => setStatusChangeNote(e.target.value)}
                          placeholder="ระบุรายละเอียดเกี่ยวกับการเปลี่ยนสถานะนี้ที่จะแสดงในแจ้งเตือน..."
                        />
                      </div>
                      
                      <div>
                        <Label>
                          หมายเหตุเพิ่มเติม (สำหรับการวิเคราะห์):
                          <SubLabel>ข้อความนี้จะไม่แสดงในแจ้งเตือน แต่จะเก็บไว้ในระบบ</SubLabel>
                        </Label>
                        <RemarksTextarea
                          value={statusChangeRemarks}
                          onChange={(e) => setStatusChangeRemarks(e.target.value)}
                          placeholder="ระบุรายละเอียดเพิ่มเติมสำหรับการวิเคราะห์หรือติดตามผล..."
                        />
                      </div>

                      <ModalButtonGroup>
                        <CancelButton 
                          onClick={cancelStatusChange}
                          disabled={isUpdatingStatus}
                        >
                          ยกเลิก
                        </CancelButton>
                        <ConfirmButton 
                          onClick={confirmStatusChange}
                          disabled={isUpdatingStatus}
                        >
                          {isUpdatingStatus ? 'กำลังอัปเดต...' : 'ยืนยันการเปลี่ยนสถานะ'}
                        </ConfirmButton>
                      </ModalButtonGroup>
                    </ModalContent>
                  </StatusChangeModal>
                )}
              </div>
              <div ref={chatRef}>
                <ChatContainer>
                  <ChatHeader>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: "12px" }}
                    >
                      <ChatTitle>Admin Chat</ChatTitle>
                    </div>
                    <ChatStatus>Online</ChatStatus>
                  </ChatHeader>

                  <UserSelectContainer>
                    {/* Search Box for Users */}
                    <div style={{
                      marginBottom: "12px",
                      position: "relative"
                    }}>
                      <input
                        type="text"
                        placeholder="🔍 ค้นหาชื่อผู้ใช้..."
                        value={chatUserSearchTerm}
                        onChange={(e) => setChatUserSearchTerm(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 40px 10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          fontSize: "0.95rem",
                          outline: "none",
                          transition: "border-color 0.2s",
                          backgroundColor: "#fff"
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#3b82f6";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e2e8f0";
                        }}
                      />
                      {chatUserSearchTerm && (
                        <button
                          onClick={() => setChatUserSearchTerm("")}
                          style={{
                            position: "absolute",
                            right: "8px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            color: "#94a3b8",
                            cursor: "pointer",
                            padding: "4px 8px",
                            fontSize: "1.2rem",
                            lineHeight: "1"
                          }}
                          title="Clear search"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Filtered User Dropdown */}
                    <UserSelect value={selectedChatUser || ""} onChange={handleUserSelect}>
                      <option value="">-- Select User to Chat --</option>
                      <option value="announcement">
                        📢 Announcement to All Members
                      </option>
                      {(() => {
                        // Filter users based on search term
                        const filteredUsers = chatUsers.filter(chatUser => {
                          if (!chatUserSearchTerm) return true;
                          const searchLower = chatUserSearchTerm.toLowerCase();
                          const nameLower = (chatUser.name || "").toLowerCase();
                          return nameLower.includes(searchLower);
                        });

                        // Show message if no users found
                        if (chatUserSearchTerm && filteredUsers.length === 0) {
                          return (
                            <option value="" disabled>
                              ไม่พบผู้ใช้ที่ค้นหา
                            </option>
                          );
                        }

                        // Show filtered users
                        return filteredUsers.map((chatUser) => (
                          <option key={chatUser.user_id} value={chatUser.user_id}>
                            {chatUser.name}
                          </option>
                        ));
                      })()}
                    </UserSelect>

                    {/* Quick Search Results */}
                    {chatUserSearchTerm && (() => {
                      const filteredUsers = chatUsers.filter(chatUser => {
                        const searchLower = chatUserSearchTerm.toLowerCase();
                        const nameLower = (chatUser.name || "").toLowerCase();
                        return nameLower.includes(searchLower);
                      });

                      if (filteredUsers.length > 0 && filteredUsers.length <= 5) {
                        return (
                          <div style={{
                            marginTop: "8px",
                            padding: "8px",
                            backgroundColor: "#f8fafc",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0"
                          }}>
                            <div style={{
                              fontSize: "0.85rem",
                              color: "#64748b",
                              marginBottom: "8px"
                            }}>
                              พบ {filteredUsers.length} ผู้ใช้:
                            </div>
                            <div style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px"
                            }}>
                              {filteredUsers.map(chatUser => (
                                <button
                                  key={chatUser.user_id}
                                  onClick={() => {
                                    setSelectedChatUser(chatUser.user_id);
                                    setChatUserSearchTerm("");
                                    loadChatMessages(chatUser.user_id);
                                  }}
                                  style={{
                                    padding: "8px 12px",
                                    backgroundColor: selectedChatUser === chatUser.user_id ? "#3b82f6" : "#fff",
                                    color: selectedChatUser === chatUser.user_id ? "#fff" : "#334155",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "6px",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                    transition: "all 0.2s"
                                  }}
                                  onMouseEnter={(e) => {
                                    if (selectedChatUser !== chatUser.user_id) {
                                      e.target.style.backgroundColor = "#f1f5f9";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (selectedChatUser !== chatUser.user_id) {
                                      e.target.style.backgroundColor = "#fff";
                                    }
                                  }}
                                >
                                  💬 {chatUser.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </UserSelectContainer>
                  
                  {selectedChatUser === "announcement" ? (
                    // Announcement UI
                    <div>
                      <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                        <h3>📢 Send Announcement to All Members</h3>
                        <p>This message will be sent to all registered users.</p>
                      </div>
                      <InputContainer>
                        <InputWrapper>
                          <ChatTextArea
                            value={announcementMessage}
                            onChange={(e) => setAnnouncementMessage(e.target.value)}
                            placeholder="Type your announcement here..."
                          />
                          <SendButton onClick={sendAnnouncement}>
                            Send Announcement
                          </SendButton>
                        </InputWrapper>
                      </InputContainer>
                    </div>
                  ) : selectedChatUser ? (
                    // Chat UI
                    <>
                      <MessagesContainer>
                        {loadingChat && (
                          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                            Loading messages...
                          </div>
                        )}
                        {chatMessages.length === 0 && !loadingChat && (
                          <div style={{ textAlign: 'center', color: '#64748b' }}>
                            No messages yet. Start the conversation!
                          </div>
                        )}
                        {chatMessages.map((msg) => (
                          <MessageBubble
                            key={msg.id}
                            $isAdmin={msg.sender_type === 'admin'}
                            id={`msg-${msg.id}`}
                          >
                            <MessageSender $isAdmin={msg.sender_type === 'admin'}>
                              {msg.sender_type === 'admin'
                                ? 'Admin'
                                : chatUsers.find(u => u.user_id === msg.user_id)?.name || 'User'}
                            </MessageSender>
                            <div>{msg.message}</div>
                            <MessageTimeStyled $isAdmin={msg.sender_type === 'admin'}>
                              {msg.timestamp ? formatDate.timeOnly(msg.timestamp) : ''}
                            </MessageTimeStyled>
                          </MessageBubble>
                        ))}
                        <div ref={messagesEndRef} />
                      </MessagesContainer>
                      <InputContainer>
                        <InputWrapper>
                          <ChatTextArea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message here..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendChatMessage();
                              }
                            }}
                          />
                          <ClearButton onClick={clearChatHistory}>Clear History</ClearButton>
                          <SendButton onClick={sendChatMessage} disabled={!newMessage.trim()}>
                            Send
                          </SendButton>
                        </InputWrapper>
                      </InputContainer>
                    </>
                  ) : (
                    // No user selected
                    <div style={{ 
                      padding: "40px", 
                      textAlign: "center", 
                      color: "#64748b",
                      fontSize: "1.1rem"
                    }}>
                      <div style={{ marginBottom: "16px" }}>
                        💬 Select a user from the dropdown above to start chatting
                      </div>
                      <div style={{ fontSize: "0.9rem", opacity: 0.7 }}>
                        Or choose "Announcement" to send a message to all members
                      </div>
                    </div>
                  )}
                </ChatContainer>
              </div>
              <NotificationDropdown
                $visible={showNotifications}
                style={{
                  transform: `translate(${notificationPosition.x}px, ${notificationPosition.y}px)`,
                  cursor: isDragging ? "grabbing" : "grab",
                }}
                onMouseDown={handleMouseDown}
              >
                <CloseButton onClick={() => setShowNotifications(false)}>
                  &times;
                </CloseButton>
                <NotificationHeader>
                  <NotificationTitle>การแจ้งเตือนล่าสุด</NotificationTitle>
                  <div>
                    <MarkAllRead onClick={() => markAsRead()}>
                      อ่านทั้งหมด
                    </MarkAllRead>
                    <MarkAllRead
                      onClick={() => {
                        if (
                          window.confirm(
                            "คุณแน่ใจหรือไม่ว่าต้องการลบการแจ้งเตือนทั้งหมด?"
                          )
                        ) {
                          notifications.forEach((n) => deleteNotification(n.id));
                        }
                      }}
                      style={{ marginLeft: "10px", color: "#ef4444" }}
                    >
                      ลบทั้งหมด
                    </MarkAllRead>
                  </div>
                </NotificationHeader>

                {notifications.length > 0 ? (
                  notifications.map((notification) => {
                    const isNewMsg = notification.meta_data?.type === 'new_message';
                    let senderName = notification.sender_name || notification.meta_data?.sender_name;
                    
                    // หาชื่อจริงจาก data array ทุกครั้ง (แม้จะมี senderName แล้ว)
                    if (notification.meta_data?.user_id) {
                      const ticket = data.find(t => t.user_id === notification.meta_data.user_id || t.ticket_id === notification.meta_data.user_id);
                      
                      if (ticket?.name) {
                        senderName = ticket.name;
                      } else if (!senderName) {
                        senderName = userIdToNameMap[notification.meta_data.user_id] || `User ${notification.meta_data.user_id?.substring(0, 8) || 'Unknown'}`;
                      }
                    }
                    senderName = senderName || '-';
                    return (
                      <NotificationItem
                        key={notification.id}
                        $unread={!notification.read}
                        style={{ cursor: isNewMsg ? 'pointer' : 'default' }}
                        onClick={isNewMsg ? () => {
                          setSelectedChatUser(notification.meta_data.user_id);
                          setActiveTab('chat');
                          scrollToChat();
                          loadChatMessages(notification.meta_data.user_id);
                          setHighlightMsgId(null);
                          markAsRead(notification.id);
                          // เลื่อนไปข้อความล่าสุดหลังจากคลิกแจ้งเตือน
                          setTimeout(() => {
                            scrollToLatestMessage();
                          }, 500); // รอสักหน่อยให้ loadChatMessages เสร็จก่อน
                        } : undefined}
                      >
                        <NotificationContent>
                          {isNewMsg ? (
                            <>
                              <div><b>ผู้ส่ง:</b> {senderName}</div>
                              <div><b>เนื้อหา:</b> {notification.message}</div>
                              <div><b>เวลา:</b> {formatDate.thaiDateTime(notification.timestamp)}</div>
                            </>
                          ) : (
                            notification.message
                          )}
                        </NotificationContent>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "8px",
                          }}
                        >
                          <NotificationTime>
                            {formatDate.thaiDateTime(notification.timestamp)}
                          </NotificationTime>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                            }}
                          >
                            ลบ
                          </button>
                        </div>
                      </NotificationItem>
                    );
                  })
                ) : (
                  <EmptyNotifications>ไม่มีการแจ้งเตือน</EmptyNotifications>
                )}
              </NotificationDropdown>
              {editError && (
                <div style={{ color: '#ef4444', textAlign: 'center', margin: '8px' }}>{editError}</div>
              )}
              {editSuccess && (
                <div style={{ color: '#10b981', textAlign: 'center', margin: '8px' }}>{editSuccess}</div>
              )}
        
            <ToastContainer />
            
            {/* ป๊อบอัพแจ้งเตือนข้อความใหม่ */}
            {newMessageAlert && (
              <NewMessageNotification
                alert={newMessageAlert}
                onClose={() => setNewMessageAlert(null)}
                onReply={(user_id) => {
                  console.log('🎯 onReply called with user_id:', user_id);
                  
                  // Ensure user exists in chatUsers list
                  const userExists = chatUsers.find(u => u.user_id === user_id);
                  if (!userExists && user_id && user_id !== "announcement") {
                    const userName = newMessageAlert?.user || 
                                   newMessageAlert?.sender_name || 
                                   `User ${user_id.substring(0, 8)}`;
                    const newUser = {
                      user_id: user_id,
                      name: userName,
                      last_message_time: new Date().toISOString()
                    };
                    setChatUsers(prev => [...prev, newUser]);
                    console.log('➕ Added new user to chatUsers:', newUser);
                  }
                  
                  // Navigate to chat tab and select user
                  setActiveTab('chat');
                  setSelectedChatUser(user_id);
                  
                  // Load messages for the user
                  if (user_id && user_id !== "announcement") {
                    loadChatMessages(user_id);
                  }
                  
                  // Close the notification popup
                  setNewMessageAlert(null);
                  
                  // Focus on chat input after a short delay to ensure UI is updated
                  setTimeout(() => {
                    const chatInput = document.querySelector('textarea[placeholder="Type your message here..."]');
                    if (chatInput) {
                      chatInput.focus();
                      console.log('✅ Chat input focused');
                    }
                    scrollToLatestMessage();
                  }, 200);
                  
                  console.log('✅ Navigation to chat completed for user:', user_id);
                }}
              />
            )}
            </Container>
          </MainContent>
        </>
        </ProtectedRoute>
      } />
      

      
      {/* Email Alert System Routes */}
      <Route path="/email-alerts" element={
        <ProtectedRoute>
          <EmailAlertHistory />
        </ProtectedRoute>
      } />
      
      <Route path="/email-templates" element={
        <ProtectedRoute>
          <EmailTemplateManager />
        </ProtectedRoute>
      } />
      
      <Route path="/alert-settings" element={
        <ProtectedRoute>
          <AlertSettings />
        </ProtectedRoute>
      } />
      
      {/* User Management Routes */}
      <Route path="/user-management" element={
        <ProtectedRoute>
          <UserManagement />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
      

    </PermissionProvider>
  );
}

export default App;
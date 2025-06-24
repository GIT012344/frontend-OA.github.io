"use client";

import { useState, useEffect, useCallback, useRef } from "react"; // Added useRef here
import axios from "axios";
import styled from "styled-components";

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
    props.primary
      ? "linear-gradient(135deg, #475569 0%, #64748b 100%)"
      : "rgba(255, 255, 255, 0.9)"};
  color: ${(props) => (props.primary ? "white" : "#475569")};
  border: ${(props) => (props.primary ? "none" : "1px solid #e2e8f0")};
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: ${(props) =>
    props.primary
      ? "0 4px 12px rgba(71, 85, 105, 0.15)"
      : "0 2px 8px rgba(0, 0, 0, 0.04)"};

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${(props) =>
    props.primary
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
    background-image: ${(props) =>
    props.primary
      ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'/%3E%3C/svg%3E")`
      : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'/%3E%3C/svg%3E")`};
    background-size: contain;
    background-repeat: no-repeat;
  }
`;

const Dashboard = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
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
    props.accent || "linear-gradient(90deg, #64748b, #94a3b8)"};
    opacity: 0.8;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.85);
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

const StatValue = styled.p`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
  line-height: 1;
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
  background-color: ${(props) => props.$bgColor || ""};

  &:nth-child(even) {
    background-color: ${(props) =>
    props.$bgColor ? props.$bgColor : "rgba(248, 250, 252, 0.5)"};
  }

  &:hover {
    background-color: ${(props) =>
    props.$bgColor
      ? props.$bgColor === "#ffebee"
        ? "#ffcdd2"
        : props.$bgColor === "#fff3e0"
          ? "#ffe0b2"
          : props.$bgColor === "#fffde7"
            ? "#fff59d"
            : "rgba(241, 245, 249, 0.8)"
      : "rgba(241, 245, 249, 0.8)"};
    transform: scale(1.001);
  }
`;

const TableCell = styled.td`
  padding: 16px 20px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  font-size: 0.9rem;
  color: #334155;
  line-height: 1.5;
`;

const StatusSelect = styled.select`
  padding: 8px 16px;
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
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231e293b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'/%3E%3C/svg%3E");
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

const Message = styled.div`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.5;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  ${(props) =>
    props.isAI
      ? `
    align-self: flex-start;
    background: white;
    border: 1px solid #e2e8f0;
    border-bottom-left-radius: 0;
    
    &::before {
      content: "";
      position: absolute;
      bottom: 0;
      left: -8px;
      width: 0;
      height: 0;
      border-right: 8px solid white;
      border-top: 8px solid transparent;
      filter: drop-shadow(-2px 2px 1px rgba(0,0,0,0.05));
    }
  `
      : `
    align-self: flex-end;
    background: linear-gradient(135deg, #475569 0%, #64748b 100%);
    color: white;
    border-bottom-right-radius: 0;
    
    &::before {
      content: "";
      position: absolute;
      bottom: 0;
      right: -8px;
      width: 0;
      height: 0;
      border-left: 8px solid #475569;
      border-top: 8px solid transparent;
    }
  `}
`;

const MessageTime = styled.div`
  font-size: 0.7rem;
  color: ${(props) => (props.isAI ? "#64748b" : "rgba(255,255,255,0.7)")};
  margin-top: 4px;
  text-align: right;
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
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
  }

  ${(props) =>
    props.hasUnread &&
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
  position: fixed; // เปลี่ยนจาก absolute เป็น fixed
  top: 80px;
  right: 20px;
  width: 380px;
  max-height: 500px;
  overflow-y: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  z-index: 100;
  transform-origin: top right;
  transform: ${(props) =>
    props.visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(-10px)"};
  opacity: ${(props) => (props.visible ? 1 : 0)};
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: move; // เพิ่ม cursor แบบเลื่อนได้
  user-select: none; // ป้องกันการเลือกข้อความขณะลาก
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
    props.unread &&
    `
    background: #f8fafc;
    border-left: 3px solid #3b82f6;
  `}
`;

const NotificationContent = styled.p`
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
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const DateInput = styled.input`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #64748b;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.1);
    background: white;
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
  color: ${(props) => (props.active ? "#1e293b" : "#64748b")};
  background: ${(props) => (props.active ? "#f1f5f9" : "transparent")};
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
`;

const EmailRankingCard = styled(StatCard)`
  grid-column: span 2;
  min-height: 300px;
`;

const RankingList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RankingItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;
`;

const RankBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${(props) =>
    props.rank === 1
      ? "#f59e0b"
      : props.rank === 2
        ? "#94a3b8"
        : props.rank === 3
          ? "#b45309"
          : "#e2e8f0"};
  color: ${(props) => (props.rank <= 3 ? "white" : "#475569")};
  font-weight: 600;
  margin-right: 12px;
`;

const EmailInfo = styled.div`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const TicketCount = styled.span`
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
`;

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState([]);
  const [textboxInputs, setTextboxInputs] = useState({}); // eslint-disable-line no-unused-vars
  const [lastSync, setLastSync] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const [notificationPosition, setNotificationPosition] = useState({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [messages, setMessages] = useState([]);
  const [adminId] = useState("admin01");
  const [emailRankings, setEmailRankings] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarHover, setSidebarHover] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dashboardRef = useRef(null);
  const listRef = useRef(null);
  const chatRef = useRef(null);

  // Add these scroll functions
  const scrollToDashboard = () => {
    dashboardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToList = () => {
    listRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToChat = () => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  };
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("https://backend-oa-pqy2.onrender.com/api/data", {
          timeout: 30000
        });

        if (response.status === 200) {
          setData(Array.isArray(response.data) ? response.data : []);
        } else {
          console.error("Received non-200 status:", response.status);
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);

        // Implement retry logic
        if (error.code === 'ECONNABORTED' || !error.response) {
          console.log("Retrying request...");
          setTimeout(fetchData, 5000); // Retry after 5 seconds
        }

        setData([]); // Fallback to empty array
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getRowColor = (createdAt, status) => {
    // ถ้าสถานะเป็น Completed ให้แสดงสีเขียวทันที
    if (status === "Completed") {
      return "#76BC43"; // สีเขียวอ่อน
    }

    if (!createdAt) return "";

    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = (now - createdDate) / (1000 * 60);

    if (diffInMinutes > 14400) {
      // 15 นาที (5+5+5) มากกว่า 10 วัน
      return "#F26665"; // สีแดง
    } else if (diffInMinutes > 7200) {
      // 10 นาที (5+5) มากกว่า 5 วัน
      return "#FFD0A7"; // สีส้ม
    } else if (diffInMinutes > 5760) {
      // 5 นาที มากกว่า 3 วัน
      return "#FBEE95"; // สีเหลือง
    }
    return ""; // ไม่มีสี (ค่าปกติ)
  };

  // ดึงข้อมูลจาก PostgreSQL ทุก 10 วิ
  useEffect(() => {
    const sync = async () => {
      try {
        const response = await axios.get("https://backend-oa-pqy2.onrender.com/sync-tickets", {
          timeout: 10000 // ตั้งค่า timeout 10 วินาที
        });

        console.log("✅ Synced from Google Sheets");
        setLastSync(new Date());

        const newData = Array.isArray(response?.data) ? response.data : [];

        try {
          const clearResponse = await axios.post("https://backend-oa-pqy2.onrender.com/clear-textboxes");
          if (clearResponse.data.cleared_count > 0) {
            console.log(`✅ Cleared ${clearResponse.data.cleared_count} textboxes`);
          }
        } catch (err) {
          console.error("Textbox clear error:", err);
        }

        setData((prevData) => {
          const textboxUpdates = [];

          if (Array.isArray(prevData) && Array.isArray(newData)) {
            newData.forEach((newTicket) => {
              const oldTicket = prevData.find(
                (t) => t["Ticket ID"] === newTicket["Ticket ID"]
              );
              // เพิ่มเงื่อนไขตรวจสอบว่า TEXTBOX มีค่าหรือไม่
              if (
                oldTicket &&
                newTicket.TEXTBOX &&
                newTicket.TEXTBOX !== oldTicket.TEXTBOX
              ) {
                textboxUpdates.push({
                  id: Date.now() + Math.random(),
                  message: `New message for ticket ${newTicket["Ticket ID"]}: ${newTicket.TEXTBOX}`,
                  timestamp: new Date().toISOString(),
                  read: false,
                });
              }
            });
          }

          if (textboxUpdates.length > 0) {
            setNotifications((prev) => [...textboxUpdates, ...prev]);
            setHasUnread(true);

            // Play notification sound
            const audio = new Audio("/notification.mp3");
            audio.play().catch((e) => console.log("Audio play failed:", e));
          }

          return newData;
        });

      } catch (error) {
        console.error("❌ Sync error:", error);

        // แสดงข้อความผิดพลาดให้ผู้ใช้ทราบ
        if (error.response) {
          // ข้อผิดพลาดจากเซิร์ฟเวอร์ (5xx, 4xx)
          console.error("Server responded with:", error.response.status);
          console.error("Error details:", error.response.data);
        } else if (error.request) {
          // ไม่ได้รับ response จากเซิร์ฟเวอร์
          console.error("No response received from server");
        } else {
          // ข้อผิดพลาดอื่นๆ
          console.error("Error setting up request:", error.message);
        }

        // ตั้งค่า fallback data เพื่อไม่ให้แอพพัง
        setData([]);
      }
    };

    sync();
    const interval = setInterval(sync, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchEmailRankings = async () => {
      try {
        const response = await axios.get(
          "https://backend-oa-pqy2.onrender.com/api/email-rankings"
        );
        setEmailRankings(response.data);
      } catch (error) {
        console.error("Error fetching email rankings:", error);
        setEmailRankings([]);
      }
    };

    fetchEmailRankings();
  }, [data]);

  useEffect(() => {
    const fetchNotifications = () => {
      axios
        .get("https://backend-oa-pqy2.onrender.com/api/notifications")
        .then((res) => {
          setNotifications(res.data);
          // Check if there are any unread notifications
          const unread = res.data.some((notification) => !notification.read);
          setHasUnread(unread);
        })
        .catch((err) => console.error("Error fetching notifications:", err));
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchDataByDate = () => {
    if (!startDate) return;

    axios
      .get("https://backend-oa-pqy2.onrender.com/api/data-by-date", {
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

  const resetDateFilter = () => {
    setStartDate("");
    setIsDateFilterActive(false);
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");

    axios
      .get("https://backend-oa-pqy2.onrender.com/api/data")
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
        .post("https://backend-oa-pqy2.onrender.com/mark-notification-read", { id })
        .then(() => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
          );
          setHasUnread(notifications.some((n) => !n.read && n.id !== id));
        });
    } else {
      // Mark all notifications as read
      axios
        .post("https://backend-oa-pqy2.onrender.com/mark-all-notifications-read")
        .then(() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          setHasUnread(false);
        });
    }
  };
  // Filter data based on search and filters
  const filteredData = Array.isArray(data)
    ? data.filter((row) => {
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

      // Status filter
      const matchesStatus =
        statusFilter === "all" || row["สถานะ"] === statusFilter;

      // Type filter
      const matchesType = typeFilter === "all" || row["Type"] === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    })
    : [];

  // Get unique types for filter dropdown
  const uniqueTypes = [...new Set(data.map((item) => item["Type"] || "None"))];

  // อัปเดตสถานะ
  const handleStatusChange = (ticketId, newStatus) => {
    axios
      .post(
        "https://backend-oa-pqy2.onrender.com/update-status",
        {
          ticket_id: ticketId,
          status: newStatus,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        console.log("✅ Status updated");
        setData((prevData) =>
          prevData.map((item) =>
            item["Ticket ID"] === ticketId
              ? { ...item, สถานะ: newStatus }
              : item
          )
        );
      })
      .catch((err) => console.error("❌ Failed to update status:", err));
  };

  // Handle user selection
  const handleUserSelect = (e) => {
    setSelectedUser(e.target.value);
    // Load existing message if any
    if (e.target.value) {
      const ticket = data.find((item) => item["Ticket ID"] === e.target.value);
      setChatMessage(ticket?.TEXTBOX || "");
    } else {
      setChatMessage("");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.post("https://backend-oa-pqy2.onrender.com/delete-notification", { id });
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleDeleteTicket = (ticketId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
      axios
        .post("https://backend-oa-pqy2.onrender.com/delete-ticket", {
          ticket_id: ticketId,
        })
        .then(() => {
          console.log("✅ Ticket deleted");
          // อัปเดต state เพื่อลบ ticket ออกจาก UI
          setData((prevData) =>
            prevData.filter((item) => item["Ticket ID"] !== ticketId)
          );
        })
        .catch((err) => {
          console.error("❌ Failed to delete ticket:", err);
          alert("Failed to delete ticket: " + err.message);
        });
    }
  };

  const handleClearChat = async () => {
    if (!selectedUser) return;

    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการสนทนาทั้งหมด?")) {
      try {
        // ลบข้อความทั้งหมดในตาราง messages ที่เกี่ยวข้องกับ ticket_id นี้
        await axios.post(
          "https://backend-oa-pqy2.onrender.com/api/messages/delete",
          {
            ticket_id: selectedUser,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // อัปเดต state เพื่อลบข้อความออกจาก UI
        setMessages([]);

        // อัปเดต textbox ในตาราง tickets เป็นค่าว่าง
        await axios.post(
          "https://backend-oa-pqy2.onrender.com/update-textbox",
          {
            ticket_id: selectedUser,
            textbox: "",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // อัปเดต local state
        setChatMessage("");
        alert("ลบประวัติการสนทนาสำเร็จ");
      } catch (err) {
        console.error("❌ Failed to clear messages:", err);
        alert("เกิดข้อผิดพลาดในการลบประวัติการสนทนา");
      }
    }
  };

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedUser) return;

      try {
        const response = await axios.get("https://backend-oa-pqy2.onrender.com/api/messages", {
          params: { ticket_id: selectedUser },
        });
        setMessages(response.data);

        // ทำเครื่องหมายว่าข้อความถูกอ่านแล้ว
        if (response.data.length > 0) {
          await axios.post("https://backend-oa-pqy2.onrender.com/api/messages/mark-read", {
            ticket_id: selectedUser,
            admin_id: adminId,
          });
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    loadMessages();
  }, [selectedUser, adminId]);

  const handleChatSubmit = async () => {
    if (!selectedUser || !chatMessage.trim()) return;

    if (selectedUser === "announcement") {
      if (
        !window.confirm(
          "คุณแน่ใจหรือไม่ว่าต้องการส่งประกาศนี้ไปยังสมาชิกทั้งหมด?"
        )
      ) {
        return;
      }

      try {
        const response = await axios.post(
          "https://backend-oa-pqy2.onrender.com/send-announcement",
          { message: chatMessage },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.success) {
          alert(`ส่งประกาศสำเร็จไปยัง ${response.data.recipient_count} คน`);
          setChatMessage("");

          setNotifications((prev) => [
            {
              id: Date.now(),
              message: `ประกาศใหม่: ${chatMessage}`,
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
        alert("เกิดข้อผิดพลาดในการส่งประกาศ");
      }
      return;
    }

    try {
      // 1. อัปเดต Textbox
      await axios.post(
        "https://backend-oa-pqy2.onrender.com/update-textbox",
        {
          ticket_id: selectedUser,
          textbox: chatMessage,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // 2. เพิ่มข้อความใหม่ในระบบ messages
      const messageResponse = await axios.post(
        "https://backend-oa-pqy2.onrender.com/api/messages",
        {
          ticket_id: selectedUser,
          admin_id: adminId,
          sender_name: "Admin",
          message: chatMessage,
          is_admin_message: true,
        }
      );

      setChatMessage("");

      setMessages((prev) => [
        ...prev,
        {
          id: messageResponse.data.id,
          ticket_id: selectedUser,
          admin_id: adminId,
          sender_name: "Admin",
          message: chatMessage,
          timestamp: messageResponse.data.timestamp,
          is_read: true,
          is_admin_message: true,
        },
      ]);

      // 4. Clear the textbox in the database
      await axios.post(
        "https://backend-oa-pqy2.onrender.com/update-textbox",
        {
          ticket_id: selectedUser,
          textbox: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      console.error("❌ Failed to send message:", err);
      alert("เกิดข้อผิดพลาดในการส่งข้อความ");
    }
  };

  // Format last sync time
  const formatLastSync = () => {
    if (!lastSync) return "ยังไม่มีการซิงค์ข้อมูล";
    return `ซิงค์ล่าสุด: ${lastSync.toLocaleTimeString()}`;
  };

  const checkBackendHealth = async () => {
    try {
      const response = await axios.get('https://backend-oa-pqy2.onrender.com/health', {
        timeout: 5000
      });
      console.log('Backend status:', response.data.status);
      return true;
    } catch (error) {
      console.error('Backend is down:', error);
      return false;
    }
  };

  const handleRefreshChat = async () => {
    if (!selectedUser) return;

    try {
      const response = await axios.post(
        "https://backend-oa-pqy2.onrender.com/refresh-messages",
        {
          ticket_id: selectedUser,
          admin_id: adminId,
        }
      );

      setMessages(response.data.messages);
    } catch (err) {
      console.error("Failed to refresh messages:", err);
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

    const csvContent = [
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
          `"${row["Requeste"] || ""}"`,
          `"${row["Report"] || ""}"`,
          `"${row["Type"] || "None"}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `tickets_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      Request: row["Requeste"],
      Report: row["Report"],
      Type: row["Type"] || "None",
    }));

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `tickets_${new Date().toISOString().split("T")[0]}.json`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Count tickets by status
  const getStatusCounts = () => {
    const counts = {
      Pending: 0,
      Scheduled: 0,
      "In Progress": 0,
      Waiting: 0,
      Completed: 0,
    };

    data.forEach((ticket) => {
      if (counts.hasOwnProperty(ticket["สถานะ"])) {
        counts[ticket["สถานะ"]]++;
      }
    });

    return counts;
  };

  const filterByEmail = (email) => {
    setSearchTerm(email);
    setActiveTab("list");
    scrollToList();
  };

  const statusCounts = getStatusCounts();

  return (
    <>
      <Sidebar
        $collapsed={!sidebarOpen}
        $hovered={sidebarHover}
        onMouseEnter={() => setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
      >
        <Logo>{sidebarOpen || sidebarHover ? "Helpdesk-System" : "HS"}</Logo>
        <ToggleButton
          onClick={() => setSidebarOpen(!sidebarOpen)}
          $collapsed={!sidebarOpen}
        />
        <NavItem
          icon="dashboard"
          active={activeTab === "dashboard"}
          onClick={() => {
            setActiveTab("dashboard");
            scrollToDashboard();
          }}
          $collapsed={!sidebarOpen}
          data-tooltip="Dashboard"
        >
          <span>Dashboard</span>
        </NavItem>
        <NavItem
          icon="list"
          active={activeTab === "list"}
          onClick={() => {
            setActiveTab("list");
            scrollToList();
          }}
          $collapsed={!sidebarOpen}
          data-tooltip="List"
        >
          <span>Ticket List</span>
        </NavItem>
        <NavItem
          icon="chat"
          active={activeTab === "chat"}
          onClick={() => {
            setActiveTab("chat");
            scrollToChat();
          }}
          $collapsed={!sidebarOpen}
          data-tooltip="Chat"
        >
          <span>Chat</span>
        </NavItem>
      </Sidebar>
      <MainContent style={{ marginLeft: sidebarOpen ? "240px" : "80px" }}>
        <Container>
          {loading && (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              Loading data...
            </div>
          )}
          {error && (
            <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>
              Error: {error}
            </div>
          )}
          {!loading && !error && (
            <>
              <div ref={dashboardRef}>
                <Title>Ticket Management System</Title>
                <SyncIndicator>{formatLastSync()}</SyncIndicator>
                <HeaderSection>
                  <div></div>
                  <ExportSection>
                    <NotificationBell
                      hasUnread={hasUnread}
                      onClick={() => {
                        setShowNotifications(!showNotifications);
                        if (hasUnread && !showNotifications) {
                          markAsRead();
                        }
                      }}
                    />
                    <ExportButton onClick={exportToCSV}>ส่งออก CSV</ExportButton>
                    <ExportButton primary onClick={exportToJSON}>
                      ส่งออก JSON
                    </ExportButton>
                  </ExportSection>
                </HeaderSection>
                {/* Dashboard */}
                <Dashboard>
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <StatCard
                      key={status}
                      accent={
                        status === "Pending"
                          ? "linear-gradient(90deg, #ef4444, #f87171)"
                          : status === "Scheduled"
                            ? "linear-gradient(90deg, #06b6d4, #67e8f9)"
                            : status === "In Progress"
                              ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                              : status === "Waiting"
                                ? "linear-gradient(90deg, #8b5cf6, #a78bfa)"
                                : "linear-gradient(90deg, #10b981, #34d399)"
                      }
                    >
                      <StatTitle>{status}</StatTitle>
                      <StatValue>{count}</StatValue>
                    </StatCard>
                  ))}
                  <StatCard accent="linear-gradient(90deg, #6366f1, #8b5cf6)">
                    <StatTitle>ระบบถูกใช้งานทั้งหมด</StatTitle>
                    <StatValue>{data.length}</StatValue>
                    <div
                      style={{
                        marginTop: "12px",
                        fontSize: "0.875rem",
                        color: "#64748b",
                      }}
                    >
                      {new Date().toLocaleDateString("th-TH", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </StatCard>
                  <StatCard accent="linear-gradient(90deg, #ec4899, #f43f5e)">
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
                  <StatCard accent="linear-gradient(90deg, #f59e0b, #f97316)">
                    <StatTitle>แผนกที่แจ้ง Ticket สูงสุด</StatTitle>
                    <RankingList>
                      {Object.entries(
                        data.reduce((acc, ticket) => {
                          const dept = ticket["แผนก"] || "ไม่ระบุ";
                          acc[dept] = (acc[dept] || 0) + 1;
                          return acc;
                        }, {})
                      )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([dept, count], index) => (
                          <RankingItem key={dept}>
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <RankBadge rank={index + 1}>{index + 1}</RankBadge>
                              <span>{dept}</span>
                            </div>
                            <TicketCount>{count} tickets</TicketCount>
                          </RankingItem>
                        ))}
                    </RankingList>
                  </StatCard>
                  <EmailRankingCard>
                    <StatTitle>Top 5 Emails by Ticket Count</StatTitle>
                    {emailRankings.length > 0 ? (
                      <RankingList>
                        {emailRankings.map((item, index) => (
                          <RankingItem key={item.email}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                flex: 1,
                              }}
                            >
                              <RankBadge rank={index + 1}>{index + 1}</RankBadge>
                              <EmailInfo
                                title={item.email}
                                onClick={() => filterByEmail(item.email)}
                                style={{
                                  cursor: "pointer",
                                  "&:hover": { textDecoration: "underline" },
                                }}
                              >
                                {item.email}
                              </EmailInfo>
                            </div>
                            <TicketCount>{item.count} tickets</TicketCount>
                          </RankingItem>
                        ))}
                      </RankingList>
                    ) : (
                      <div
                        style={{
                          color: "#64748b",
                          textAlign: "center",
                          marginTop: "20px",
                        }}
                      >
                        No email data available
                      </div>
                    )}
                  </EmailRankingCard>
                  <StatCard
                    accent="linear-gradient(90deg, #3b82f6, #2563eb)"
                    style={{ gridColumn: "span 2" }}
                  >
                    <StatTitle>นัดหมายล่าสุด</StatTitle>
                    <div style={{ marginTop: "16px" }}>
                      {data
                        .filter((ticket) => ticket["Appointment"])
                        .sort(
                          (a, b) =>
                            new Date(b["Appointment"]) - new Date(a["Appointment"])
                        )
                        .slice(0, 3)
                        .map((ticket) => (
                          <div
                            key={ticket["Ticket ID"]}
                            style={{
                              marginBottom: "12px",
                              padding: "12px",
                              background: "rgba(241, 245, 249, 0.5)",
                              borderRadius: "8px",
                            }}
                          >
                            <div style={{ fontWeight: "600" }}>
                              {ticket["ชื่อ"]}
                            </div>
                            <div style={{ fontSize: "0.875rem", color: "#475569" }}>
                              {new Date(ticket["Appointment"]).toLocaleString(
                                "th-TH",
                                {
                                  dateStyle: "full",
                                  timeStyle: "short",
                                }
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "#64748b",
                                marginTop: "4px",
                              }}
                            >
                              {ticket["แผนก"]} • {ticket["สถานะ"]}
                            </div>
                          </div>
                        ))}
                    </div>
                  </StatCard>
                </Dashboard>
              </div>
              <div ref={listRef}>
                <StatCard
                  accent="linear-gradient(90deg, #3b82f6, #2563eb)"
                  style={{ gridColumn: "span 2" }}
                >
                  <StatTitle>นัดหมายล่าสุด</StatTitle>
                  <div style={{ marginTop: "16px" }}>
                    {data
                      .filter((ticket) => ticket["Appointment"])
                      .sort((a, b) => {
                        // Sort by either the "วันที่แจ้ง" field or by the appointment date itself
                        const dateA = new Date(a["วันที่แจ้ง"] || a["Appointment"]);
                        const dateB = new Date(b["วันที่แจ้ง"] || b["Appointment"]);
                        return dateB - dateA; // Newest first
                      })
                      .slice(0, 3) // Show only the 3 most recent
                      .map((ticket) => (
                        <div
                          key={ticket["Ticket ID"]}
                          style={{
                            marginBottom: "12px",
                            padding: "12px",
                            background: "rgba(241, 245, 249, 0.5)",
                            borderRadius: "8px",
                          }}
                        >
                          <div style={{ fontWeight: "600" }}>
                            {ticket["ชื่อ"]} (Ticket ID: {ticket["Ticket ID"]})
                          </div>
                          <div style={{ fontSize: "0.875rem", color: "#475569" }}>
                            {new Date(ticket["Appointment"]).toLocaleString(
                              "th-TH",
                              {
                                dateStyle: "full",
                                timeStyle: "short",
                              }
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#64748b",
                              marginTop: "4px",
                            }}
                          >
                            {ticket["แผนก"]} • {ticket["สถานะ"]} • แจ้งเมื่อ:{" "}
                            {new Date(ticket["วันที่แจ้ง"]).toLocaleString(
                              "th-TH",
                              {
                                dateStyle: "short",
                                timeStyle: "short",
                              }
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </StatCard>
                <TableContainer>
                  <TableTitle>รายการ Ticket ทั้งหมด</TableTitle>

                  {/* Search and Filter Section */}
                  <SearchAndFilterContainer>
                    <SearchInput
                      type="text"
                      placeholder="ค้นหา Ticket..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {/* Date Filter - Moved here */}
                    <DateFilterContainer>
                      <FilterLabel>วันที่:</FilterLabel>
                      <DateInput
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                      <FilterButton onClick={fetchDataByDate} disabled={!startDate}>
                        กรอง
                      </FilterButton>
                      <ResetButton onClick={resetDateFilter}>รีเซ็ต</ResetButton>
                      {isDateFilterActive && (
                        <div
                          style={{
                            marginTop: "8px",
                            color: "#475569",
                            fontSize: "0.875rem",
                          }}
                        >
                          กำลังแสดงข้อมูลวันที่:{" "}
                          {new Date(startDate).toLocaleDateString("th-TH")}
                        </div>
                      )}
                    </DateFilterContainer>

                    <FilterGroup>
                      <FilterLabel>สถานะ:</FilterLabel>
                      <FilterSelect
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">ทั้งหมด</option>
                        <option value="Pending">Pending</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Waiting">Waiting</option>
                        <option value="Completed">Completed</option>
                      </FilterSelect>
                    </FilterGroup>

                    <FilterGroup>
                      <FilterLabel>ประเภท:</FilterLabel>
                      <FilterSelect
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                      >
                        <option value="all">ทั้งหมด</option>
                        {uniqueTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </FilterSelect>
                    </FilterGroup>
                  </SearchAndFilterContainer>

                  <ScrollContainer>
                    <StyledTable>
                      <TableHeader>
                        <tr>
                          <TableHeaderCell>Ticket ID</TableHeaderCell>{" "}
                          <TableHeaderCell>อีเมล</TableHeaderCell>
                          <TableHeaderCell>ชื่อ</TableHeaderCell>
                          <TableHeaderCell>เบอร์ติดต่อ</TableHeaderCell>
                          <TableHeaderCell>แผนก</TableHeaderCell>
                          <TableHeaderCell>วันที่แจ้ง</TableHeaderCell>
                          <TableHeaderCell>สถานะ</TableHeaderCell>
                          <TableHeaderCell>Appointment</TableHeaderCell>
                          <TableHeaderCell>Requeste</TableHeaderCell>
                          <TableHeaderCell>Report</TableHeaderCell>
                          <TableHeaderCell>Type</TableHeaderCell>
                          <TableHeaderCell>Action</TableHeaderCell>
                        </tr>
                      </TableHeader>
                      <tbody>
                        {filteredData.map((row, i) => {
                          const rowColor = getRowColor(
                            row["วันที่แจ้ง"],
                            row["สถานะ"]
                          );
                          return (
                            <TableRow key={i} $bgColor={rowColor}>
                              <TableCell>{row["Ticket ID"] || "None"}</TableCell>{" "}
                              {/* Added this line */}
                              <TableCell>{row["อีเมล"] || "None"}</TableCell>
                              <TableCell>{row["ชื่อ"] || "None"}</TableCell>
                              <TableCell>{row["เบอร์ติดต่อ"] || "None"}</TableCell>
                              <TableCell>{row["แผนก"] || "None"}</TableCell>
                              <TableCell>{row["วันที่แจ้ง"] || "None"}</TableCell>
                              <TableCell>
                                <StatusSelect
                                  value={row["สถานะ"] || "None"}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      row["Ticket ID"],
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="None">None</option>
                                  <option value="Pending">Pending</option>
                                  <option value="Scheduled">Scheduled</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Waiting">Waiting</option>
                                  <option value="Completed">Completed</option>
                                </StatusSelect>
                              </TableCell>
                              <TableCell>{row["Appointment"] || "None"}</TableCell>
                              <TableCell>{row["Requeste"] || "None"}</TableCell>
                              <TableCell>{row["Report"] || "None"}</TableCell>
                              <TableCell>{row["Type"] || "None"}</TableCell>
                              <TableCell>
                                <button
                                  onClick={() =>
                                    handleDeleteTicket(row["Ticket ID"])
                                  }
                                  style={{
                                    background: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                  }}
                                  onMouseOver={(e) =>
                                    (e.target.style.opacity = "0.8")
                                  }
                                  onMouseOut={(e) => (e.target.style.opacity = "1")}
                                >
                                  ลบ
                                </button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </tbody>
                    </StyledTable>
                  </ScrollContainer>
                </TableContainer>
              </div>
              <div ref={chatRef}>
                <ChatContainer>
                  <ChatHeader>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: "12px" }}
                    >
                      <ChatTitle>Admin</ChatTitle>
                      <button
                        onClick={handleRefreshChat}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          padding: "6px",
                          borderRadius: "50%",
                          transition: "all 0.2s ease",
                        }}
                        title="Refresh Chat"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#64748b"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21.5 2v6h-6M2.5 22v-6h6M22 11.5A10 10 0 0 0 9.004 3.5M2 12.5a10 10 0 0 0 13 8.5" />
                        </svg>
                      </button>
                    </div>
                    <ChatStatus>Online</ChatStatus>
                  </ChatHeader>

                  <UserSelectContainer>
                    <UserSelect value={selectedUser} onChange={handleUserSelect}>
                      <option value="">-- Select User --</option>
                      <option value="announcement">
                        📢 Announcement to All Members
                      </option>
                      {data
                        .filter((row) => row["Type"] === "Information")
                        .reduce((unique, row) => {
                          if (
                            !unique.some((item) => item["อีเมล"] === row["อีเมล"])
                          ) {
                            unique.push(row);
                          }
                          return unique;
                        }, [])
                        .map((row) => (
                          <option key={row["Ticket ID"]} value={row["Ticket ID"]}>
                            {row["อีเมล"] || "None"} ({row["ชื่อ"] || "No Name"})
                          </option>
                        ))}
                    </UserSelect>
                  </UserSelectContainer>
                  <MessagesContainer>
                    {messages.map((msg) => (
                      <Message key={msg.id} isAI={!msg.is_admin_message}>
                        <div style={{ fontWeight: "bold" }}>{msg.sender_name}</div>
                        {msg.message}
                        <MessageTime isAI={!msg.is_admin_message}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </MessageTime>
                      </Message>
                    ))}
                  </MessagesContainer>
                  {selectedUser && (
                    <InputContainer>
                      <InputWrapper>
                        <ChatTextArea
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          placeholder={
                            selectedUser === "announcement"
                              ? "Type your announcement here..."
                              : "Type your message here..."
                          }
                        />
                        <ClearButton onClick={handleClearChat}>Clear</ClearButton>
                        <SendButton onClick={handleChatSubmit}>
                          {selectedUser === "announcement"
                            ? "Send Announcement"
                            : "Send"}
                        </SendButton>
                      </InputWrapper>
                    </InputContainer>
                  )}
                </ChatContainer>
              </div>
              <NotificationDropdown
                visible={showNotifications}
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
                  notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      unread={!notification.read}
                    >
                      <NotificationContent>
                        {notification.message &&
                          typeof notification.message === "string" &&
                          notification.message.includes("New message from") ? (
                          <>
                            <div
                              style={{ fontWeight: "bold", marginBottom: "4px" }}
                            >
                              New Message 📩 from{" "}
                              {notification.message
                                .split(" from ")[1]
                                ?.split(" for ticket")[0] || "Unknown"}
                            </div>
                            <div
                              style={{
                                background: "#f0f4f8",
                                padding: "8px",
                                borderRadius: "4px",
                              }}
                            >
                              {notification.message.split(": ").slice(1).join(": ")}
                            </div>
                          </>
                        ) : (
                          notification.message || "No message content"
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
                          {new Date(notification.timestamp).toLocaleString()}
                        </NotificationTime>
                        <button
                          onClick={(e) => {
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
                  ))
                ) : (
                  <EmptyNotifications>ไม่มีการแจ้งเตือน</EmptyNotifications>
                )}
              </NotificationDropdown>
            </>
          )}
        </Container>
      </MainContent>
    </>
  );
}

export default App;
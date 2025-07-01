"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import styled from "styled-components";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import { useAuth } from './AuthContext';
import './styles.css';

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
`;

// เพิ่มคลาสสำหรับสถานะโดยเฉพาะ
const StatusCell = styled(TableCell)`
  max-width: 120px;
  min-width: 90px;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  padding: 12px 10px;
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

// --- Chat Message Bubble Styled Components ---
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
    props.$rank === 1
      ? "#f59e0b"
      : props.$rank === 2
        ? "#94a3b8"
        : props.$rank === 3
          ? "#b45309"
          : "#e2e8f0"};
  color: ${(props) => (props.$rank <= 3 ? "white" : "#475569")};
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

// ExpandableCell component for handling long text
function ExpandableCell({ text, maxLines = 4 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text || text === "None") return <span>None</span>;
  
  const lines = text.split(/\r?\n/).flatMap(line => {
    if (line.length <= 80) return [line];
    const chunks = [];
    for (let i = 0; i < line.length; i += 80) {
      chunks.push(line.slice(i, i + 80));
    }
    return chunks;
  });
  
  const isLong = lines.length > maxLines;
  
  return (
    <div style={{ whiteSpace: "pre-line", wordBreak: "break-word", background: "#fff", position: "relative", minHeight: 0 }}>
      {expanded || !isLong
        ? lines.join("\n")
        : lines.slice(0, maxLines).join("\n") + "..."}
      {isLong && !expanded && (
        <span
          style={{ color: "#2563eb", fontWeight: 500, cursor: "pointer", marginLeft: 8 }}
          onClick={e => { e.stopPropagation(); setExpanded(true); }}
        > ดูเพิ่มเติม</span>
      )}
      {isLong && expanded && (
        <span
          style={{ color: "#ef4444", fontWeight: 500, cursor: "pointer", marginLeft: 8 }}
          onClick={e => { e.stopPropagation(); setExpanded(false); }}
        > ย่อ</span>
      )}
    </div>
  );
}

// Dashboard styled components ใหม่
const SummaryCard = styled(StatCard)`
  grid-column: span 2;
  min-height: 200px;
  display: flex;
  flex-direction: column;
`;
const SummaryList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: rgba(241,245,249,0.5); border-radius: 3px; }
  &::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 3px; }
`;
const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;
`;
const DayTitle = styled.div`
  font-weight: 600;
  color: #1e293b;
`;
const TicketCountBadge = styled.span`
  background: ${props => props.color || '#f1f5f9'};
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 600;
  color: ${props => props.textcolor || '#475569'};
  margin-right: 6px;
  margin-bottom: 4px;
  display: inline-block;
`;
const AlertCard = styled(StatCard)`
  background: ${props => props.$alert ? '#ffebee' : 'white'};
  border-left: ${props => props.$alert ? '4px solid #ef4444' : 'none'};
`;
const AlertTitle = styled.div`
  color: ${props => props.$alert ? '#ef4444' : '#1e293b'};
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  &::before {
    content: "${props => props.$alert ? '⚠️' : ''}";
  }
`;
const AlertItem = styled.div`
  padding: 8px 0;
  border-bottom: 1px dashed #e2e8f0;
  font-size: 0.875rem;
  color: ${props => props.$alert ? '#ef4444' : '#64748b'};
  &:last-child { border-bottom: none; }
`;

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
const EditTextarea = styled.textarea`
  padding: 8px 12px;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #f8fafc;
  transition: border 0.2s;
  width: 100%;
  min-height: 40px;
  max-height: 120px;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #2563eb;
    background: #fff;
  }
`;
const EditSelect = styled.select`
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
const CancelButton = styled.button`
  background: #64748b;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #334155; }
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
const RequestReportCell = styled.td`
  padding: 10px 14px;
  font-size: 0.95rem;
  color: #334155;
  white-space: pre-line;
  word-break: break-word;
  background: transparent !important;
  border: none;
`;

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState([]);
  const [textboxInputs, setTextboxInputs] = useState({}); // eslint-disable-line no-unused-vars
  const [lastSync, setLastSync] = useState(null);
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarHover, setSidebarHover] = useState(false);
  const [backendStatus, setBackendStatus] = useState('connected'); // 'connected', 'error', 'offline'
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastError, setLastError] = useState(null);
  
  // New state variables for pagination and loading
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const rowsPerPage = 5;
  
  // New Chat System State
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatUsers, setChatUsers] = useState([]);
  
  // Announcement System State (preserved)
  const [announcementMessage, setAnnouncementMessage] = useState("");
  
  const { token, user, logout } = useAuth();

  const dashboardRef = useRef(null);
  const listRef = useRef(null);
  const chatRef = useRef(null);

  // Add offline mode handling
  const [offlineData, setOfflineData] = useState([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // เพิ่ม state สำหรับเก็บ ticket ที่ถูกเลือก
  const [selectedTicket, setSelectedTicket] = useState(null);

  // เพิ่ม state สำหรับควบคุมการแสดงอันดับผู้ใช้
  const [showAllRankings, setShowAllRankings] = useState(false);

  // เพิ่ม state สำหรับแก้ไข ticket
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Load cached data from localStorage when backend is offline
  useEffect(() => {
    if (backendStatus === 'offline' || backendStatus === 'error') {
      const cachedData = localStorage.getItem('cachedTicketData');
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          setOfflineData(parsedData);
          setIsOfflineMode(true);
          console.log("📱 Using cached data in offline mode");
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
  }, [backendStatus, data]);

  // Use offline data when backend is unavailable
  const displayData = isOfflineMode ? offlineData : data;

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

  // Health check function to test backend connectivity
  const checkBackendHealth = async () => {
    try {
      const response = await axios.get("https://backend-oa-pqy2.onrender.com/api/health", {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.status === 200) {
        console.log("✅ Backend health check passed");
        return true;
      }
    } catch (error) {
      console.warn("⚠️ Backend health check failed:", error.message);
      return false;
    }
    return false;
  };

  // Updated fetchData function with loading state
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://backend-oa-pqy2.onrender.com/api/data", {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setData(Array.isArray(response.data) ? response.data : []);
      setLastSync(new Date());
      setBackendStatus('connected');
      setLastError(null);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error("Error fetching data:", error);
      
      // Handle different types of errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setBackendStatus('offline');
        setLastError({
          status: 'NETWORK',
          message: 'Network connection failed',
          details: 'Unable to connect to backend server. Please check your internet connection.'
        });
      } else if (error.response) {
        console.error("Server error:", error.response.status, error.response.data);
        if (error.response.status === 500) {
          setBackendStatus('error');
          setLastError({
            status: error.response.status,
            message: error.response.data?.message || 'Database transaction error',
            details: error.response.data?.error || 'Unknown server error'
          });
        } else if (error.response.status === 404) {
          setBackendStatus('error');
          setLastError({
            status: error.response.status,
            message: 'API endpoint not found',
            details: 'The requested API endpoint does not exist'
          });
        } else {
          setBackendStatus('error');
          setLastError({
            status: error.response.status,
            message: `HTTP ${error.response.status} Error`,
            details: error.response.data?.message || 'Server error occurred'
          });
        }
      } else if (error.request) {
        setBackendStatus('offline');
        setLastError({
          status: 'NETWORK',
          message: 'No response from server',
          details: 'Backend server may be down or unreachable. Please try again later.'
        });
      } else {
        setBackendStatus('error');
        setLastError({
          status: 'ERROR',
          message: error.message,
          details: 'Request setup failed'
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Polling แทน Socket.IO ---
  useEffect(() => {
    // ฟังก์ชันดึงข้อมูล ticket
    const pollData = async () => {
      try {
        const response = await fetch("https://backend-oa-pqy2.onrender.com/api/data");
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

    // Poll ทันทีเมื่อโหลดหน้า
    pollData();
    // Poll ทุก 5 วินาที
    const interval = setInterval(pollData, 5000);
    return () => clearInterval(interval);
  }, []);

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

  // ฟังก์ชัน mapping สถานะใหม่และสีใหม่
  const STATUS_OPTIONS = [
    { value: "New", label: "New", color: "#e3f2fd" }, // ฟ้าอ่อนมาก
    { value: "In Progress", label: "In Progress", color: "#dbeafe" }, // ฟ้าเข้มอ่อน
    { value: "Pending", label: "Pending", color: "#fff7e6" }, // ส้มอ่อน
    { value: "Closed", label: "Closed", color: "#e6f7ee" }, // เขียวอ่อน
    { value: "Cancelled", label: "Cancelled", color: "#f3f4f6" }, // เทาอ่อน
    { value: "On Hold", label: "On Hold", color: "#ede9fe" }, // ม่วงอ่อน
    { value: "Rejected", label: "Rejected", color: "#fee2e2" }, // แดงอ่อน
  ];
  const getRowColor = (createdAt, status) => {
    // mapping สีใหม่ตามสถานะ
    const statusObj = STATUS_OPTIONS.find(s => s.value === status);
    if (statusObj) return statusObj.color;
    return "";
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("https://backend-oa-pqy2.onrender.com/api/notifications", {
          timeout: 5000, // 5 second timeout for notifications
          headers: {
            'Content-Type': 'application/json',
          }
        });
        setNotifications(response.data);
        // Check if there are any unread notifications
        const unread = response.data.some((notification) => !notification.read);
        setHasUnread(unread);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        
        // Don't show error to user for notifications, but log it
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          console.warn("Network error while fetching notifications - server may be offline");
        } else if (error.response) {
          console.error("Server error:", error.response.status, error.response.data);
        } else if (error.request) {
          console.warn("No response from server for notifications");
        } else {
          console.error("Request setup error:", error.message);
        }
        
      }
    };

    fetchNotifications();
    
    // Only retry notifications if backend is connected
    const interval = setInterval(() => {
      if (backendStatus === 'connected') {
        fetchNotifications();
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [backendStatus]);

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
  const filteredData = Array.isArray(displayData)
    ? displayData.filter((row) => {
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
  const uniqueTypes = [...new Set(displayData.map((item) => item["Type"] || "None"))];

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

  // Remove old chat functions and replace with new chat system
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
      await axios.post("https://backend-oa-pqy2.onrender.com/delete-notification", { id });
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
      try {
        const response = await axios.post(
          "https://backend-oa-pqy2.onrender.com/delete-ticket",
          { ticket_id: ticketId },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          console.log("✅ Ticket deleted");
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

  // New Chat Functions
  const loadChatMessages = async (userId) => {
    if (!userId || userId === "announcement") return;
    
    setLoadingChat(true);
    try {
      const response = await axios.get("https://backend-oa-pqy2.onrender.com/api/messages", {
        params: { user_id: userId }
      });
      setChatMessages(response.data || []);
    } catch (error) {
      console.error("Failed to load chat messages:", error);
      setChatMessages([]);
    } finally {
      setLoadingChat(false);
    }
  };

  const sendChatMessage = async () => {
    if (!selectedChatUser || !newMessage.trim() || selectedChatUser === "announcement") return;

    try {
      setLoadingChat(true);
      const payload = {
        user_id: selectedChatUser,
        sender_type: 'admin', // ต้องเป็น 'admin' (ตัวเล็ก)
        message: newMessage
      };
      const response = await axios.post("https://backend-oa-pqy2.onrender.com/api/messages", payload);

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
        await axios.post("https://backend-oa-pqy2.onrender.com/api/messages/delete", {
          user_id: selectedChatUser
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
      const response = await axios.post(
        "https://backend-oa-pqy2.onrender.com/send-announcement",
        { message: announcementMessage },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        alert(`ส่งประกาศสำเร็จไปยัง ${response.data.recipient_count} คน`);
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
      alert("เกิดข้อผิดพลาดในการส่งประกาศ");
    }
  };

  // Add this useEffect to fetch chat users from /api/chat-users
  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const response = await axios.get("https://backend-oa-pqy2.onrender.com/api/chat-users");
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
        const response = await axios.get("https://backend-oa-pqy2.onrender.com/api/messages", {
          params: { user_id: selectedChatUser }
        });
        
        if (response.data && Array.isArray(response.data)) {
          setChatMessages(response.data);
        }
      } catch (error) {
        console.error("Failed to poll messages:", error);
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
      const response = await axios.get("https://backend-oa-pqy2.onrender.com/api/data", {
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
      console.log("✅ Manual retry successful - backend reconnected");
      
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
          `"${row["Requeste"] || ""}"`,
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
      Request: row["Requeste"],
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
        'In Progress': 0,
        Pending: 0,
        Closed: 0,
        Cancelled: 0,
        'On Hold': 0,
        Rejected: 0,
      };
    }
    data.forEach(ticket => {
      if (!ticket["วันที่แจ้ง"]) return;
      const ticketDate = new Date(ticket["วันที่แจ้ง"]).toISOString().split('T')[0];
      let status = ticket["สถานะ"];
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
    const stats = {
      total: data.length,
      New: 0,
      'In Progress': 0,
      Pending: 0,
      Closed: 0,
      Cancelled: 0,
      'On Hold': 0,
      Rejected: 0,
      avgResolutionTime: 0
    };
    let totalResolutionTime = 0;
    let resolvedCount = 0;
    data.forEach(ticket => {
      let status = ticket["สถานะ"];
      if (status === "Completed" || status === "Complete") status = "Closed";
      if (stats[status] !== undefined) stats[status]++;
      if (status === "Closed" && ticket["วันที่แจ้ง"]) {
        const created = new Date(ticket["วันที่แจ้ง"]);
        const now = new Date();
        totalResolutionTime += (now - created) / (1000 * 60 * 60);
        resolvedCount++;
      }
    });
    if (resolvedCount > 0) {
      stats.avgResolutionTime = (totalResolutionTime / resolvedCount).toFixed(1);
    }
    return stats;
  };
  const getOverdueTickets = () => {
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
      const email = ticket["อีเมล"] || "ไม่ระบุอีเมล";
      userMap[email] = (userMap[email] || 0) + 1;
    });
    const rankings = Object.entries(userMap)
      .map(([email, count]) => ({ email, count }))
      .sort((a, b) => b.count - a.count);
    return rankings;
  };
  // ฟังก์ชันกรองข้อมูลที่จะแสดง (5 อันดับแรกหรือทั้งหมด)
  const getDisplayRankings = () => {
    const rankings = getUserRankings();
    return showAllRankings ? rankings : rankings.slice(0, 5);
  };

  // ฟังก์ชันเริ่มแก้ไข
  const handleEditTicket = (ticket) => {
    setEditingTicketId(ticket["Ticket ID"]);
    setEditForm({
      email: ticket["อีเมล"] || "",
      name: ticket["ชื่อ"] || "",
      phone: ticket["เบอร์ติดต่อ"] || "",
      department: ticket["แผนก"] || "",
      date: ticket["วันที่แจ้ง"] || "",
      appointment: ticket["Appointment"] || "",
      request: ticket["Requeste"] || "",
      report: ticket["Report"] || "",
      type: ticket["Type"] || "",
      status: ticket["สถานะ"] === "Completed" || ticket["สถานะ"] === "Complete" ? "Closed" : ticket["สถานะ"] || "New",
    });
    setEditError("");
    setEditSuccess("");
  };
  // ฟังก์ชันยกเลิกแก้ไข
  const handleCancelEdit = () => {
    setEditingTicketId(null);
    setEditForm({});
    setEditError("");
    setEditSuccess("");
  };
  // ฟังก์ชันเปลี่ยนค่าในฟอร์มแก้ไข
  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };
  // ฟังก์ชันบันทึกการแก้ไข
  const handleSaveEdit = async (ticketId) => {
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");
    try {
      const payload = {
        ticket_id: ticketId,
        email: editForm.email,
        name: editForm.name,
        phone: editForm.phone,
        department: editForm.department,
        date: editForm.date,
        appointment: editForm.appointment,
        request: editForm.request,
        report: editForm.report,
        type: editForm.type,
        status: editForm.status,
      };
      const response = await axios.post("https://backend-oa-pqy2.onrender.com/update-ticket", payload, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.data.deleted) {
        setData((prev) => prev.filter((item) => item["Ticket ID"] !== ticketId));
        setEditSuccess("Ticket ถูกลบ (Cancelled)");
        setTimeout(() => {
          setEditingTicketId(null);
          setEditForm({});
          setEditSuccess("");
        }, 1200);
      } else {
        setData((prev) => prev.map((item) =>
          item["Ticket ID"] === ticketId
            ? {
                ...item,
                "อีเมล": editForm.email,
                "ชื่อ": editForm.name,
                "เบอร์ติดต่อ": editForm.phone,
                "แผนก": editForm.department,
                "วันที่แจ้ง": editForm.date,
                "Appointment": editForm.appointment,
                "Requeste": editForm.request,
                "Report": editForm.report,
                "Type": editForm.type,
                "สถานะ": editForm.status,
              }
            : item
        ));
        setEditSuccess("บันทึกสำเร็จ");
        setTimeout(() => {
          setEditingTicketId(null);
          setEditForm({});
          setEditSuccess("");
        }, 1200);
      }
    } catch (err) {
      setEditError("เกิดข้อผิดพลาดในการบันทึก: " + (err.response?.data?.error || err.message));
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={token ? (
          // Main dashboard content
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
                $icon="dashboard"
                $active={activeTab === "dashboard"}
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
                $icon="list"
                $active={activeTab === "list"}
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
                $icon="chat"
                $active={activeTab === "chat"}
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
                <div ref={dashboardRef}>
                  <Title>Ticket Management System</Title>
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
                    <SummaryCard $accent="linear-gradient(90deg, #3b82f6, #2563eb)">
                      <StatTitle>สรุป Ticket รายวัน (7 วันที่ผ่านมา)</StatTitle>
                      <SummaryList>
                        {getDailySummary().map((day) => (
                          <SummaryItem key={day.date.toISOString()}>
                            <DayTitle>
                              {day.date.toLocaleDateString("th-TH", {
                                weekday: "long",
                                day: "numeric",
                                month: "short"
                              })}
                            </DayTitle>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              <TicketCountBadge>{day.count} Tickets</TicketCountBadge>
                              {STATUS_OPTIONS.map(opt => (
                                <TicketCountBadge key={opt.value} color={opt.color} textcolor={opt.value === 'Closed' ? '#059669' : '#334155'}>
                                  {day[opt.value] || 0} {opt.label}
                                </TicketCountBadge>
                              ))}
                            </div>
                          </SummaryItem>
                        ))}
                      </SummaryList>
                    </SummaryCard>

                    {/* 2. สถิติพื้นฐาน */}
                    <StatCard $accent="linear-gradient(90deg, #10b981, #34d399)">
                      <StatTitle>สถิติพื้นฐาน</StatTitle>
                      <div style={{ marginTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span>ทั้งหมด:</span>
                          <span style={{ fontWeight: '600' }}>{getBasicStats().total}</span>
                        </div>
                        {STATUS_OPTIONS.map(opt => (
                          <div key={opt.value} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                            <span>{opt.label}:</span>
                            <TicketCountBadge color={opt.color} textcolor={opt.value === 'Closed' ? '#059669' : '#334155'}>
                              {getBasicStats()[opt.value]}
                            </TicketCountBadge>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                          <span>เวลาเฉลี่ยในการแก้ไข (เฉพาะ Closed):</span>
                          <span style={{ fontWeight: '600' }}>
                            {getBasicStats().avgResolutionTime > 0 
                              ? `${getBasicStats().avgResolutionTime} ชั่วโมง` 
                              : 'ไม่มีข้อมูล'}
                          </span>
                        </div>
                      </div>
                    </StatCard>

                    {/* 3. Overdue Tickets */}
                    <AlertCard $alert={getOverdueTickets().length > 0}>
                      <StatTitle>Overdue Tickets</StatTitle>
                      {getOverdueTickets().length > 0 ? (
                        <>
                          <AlertTitle $alert>
                            มี {getOverdueTickets().length} Tickets ที่เกินกำหนด
                          </AlertTitle>
                          <SummaryList>
                            {getOverdueTickets().slice(0, 5).map(ticket => (
                              <AlertItem key={ticket.id} $alert>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span>
                                    #{ticket.id} - {ticket.name} ({ticket.department})
                                  </span>
                                  <span style={{ fontWeight: '600' }}>
                                    +{ticket.hoursOverdue} ชม.
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                  สถานะ: {ticket.status}
                                </div>
                              </AlertItem>
                            ))}
                          </SummaryList>
                          {getOverdueTickets().length > 5 && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
                              + อีก {getOverdueTickets().length - 5} Tickets
                            </div>
                          )}
                        </>
                      ) : (
                        <AlertTitle>ไม่มี Ticket ที่เกินกำหนด</AlertTitle>
                      )}
                    </AlertCard>

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
                                {user.email}
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
                            <TableHeaderCell>Ticket ID</TableHeaderCell>
                            <TableHeaderCell>อีเมล</TableHeaderCell>
                            <TableHeaderCell>ชื่อ</TableHeaderCell>
                            <TableHeaderCell>เบอร์ติดต่อ</TableHeaderCell>
                            <TableHeaderCell>แผนก</TableHeaderCell>
                            <TableHeaderCell>วันที่แจ้ง</TableHeaderCell>
                            <TableHeaderCell>สถานะ</TableHeaderCell>
                            <TableHeaderCell>Appointment</TableHeaderCell>
                            <TableHeaderCell style={{ width: '260px' }}>REQUESTE</TableHeaderCell>
                            <TableHeaderCell style={{ width: '260px' }}>REPORT</TableHeaderCell>
                            <TableHeaderCell>Type</TableHeaderCell>
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
                            return (
                              <TableRow
                                key={i}
                                $bgColor={rowColor}
                                $isSelected={selectedTicket === row["Ticket ID"]}
                                onClick={() => {
                                  setSelectedTicket(row["Ticket ID"]);
                                }}
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
                                  ) : (row["เบอร์ติดต่อ"] || "None")}
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
                                <StatusCell title={row["สถานะ"] || "None"}>
                                  {isEditing ? (
                                    <EditSelect value={editForm.status} onChange={e => handleEditFormChange("status", e.target.value)} disabled={editLoading}>
                                      {STATUS_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                      ))}
                                    </EditSelect>
                                  ) : (
                                    row["สถานะ"] === "Completed" || row["สถานะ"] === "Complete" ? "Closed" : row["สถานะ"] || "None"
                                  )}
                                </StatusCell>
                                <TableCell>
                                  {isEditing ? (
                                    <EditInput type="text" value={editForm.appointment} onChange={e => handleEditFormChange("appointment", e.target.value)} disabled={editLoading} />
                                  ) : (row["Appointment"] || "None")}
                                </TableCell>
                                <RequestReportCell $isEditing={isEditing}>
                                  {isEditing ? (
                                    <EditTextarea value={editForm.request} onChange={e => handleEditFormChange("request", e.target.value)} disabled={editLoading} />
                                  ) : <span>{row["Requeste"] || "None"}</span>}
                                </RequestReportCell>
                                <RequestReportCell $isEditing={isEditing}>
                                  {isEditing ? (
                                    <EditTextarea value={editForm.report} onChange={e => handleEditFormChange("report", e.target.value)} disabled={editLoading} />
                                  ) : <span>{row["Report"] || "None"}</span>}
                                </RequestReportCell>
                                <TableCell>
                                  {isEditing ? (
                                    <EditInput type="text" value={editForm.type} onChange={e => handleEditFormChange("type", e.target.value)} disabled={editLoading} />
                                  ) : (row["Type"] || "None")}
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
                              </TableRow>
                            );
                          })}
                        </tbody>
                      </StyledTable>
                    </ScrollContainer>

                    {/* Pagination UI */}
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0', gap: '8px', alignItems: 'center' }}>
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
                            transition: 'all 0.2s ease'
                          }}
                        >
                          ก่อนหน้า
                        </button>
                        {Array.from({ length: totalPages }, (_, idx) => (
                          <button
                            key={idx + 1}
                            onClick={() => handlePageChange(idx + 1)}
                            style={{
                              padding: '8px 12px',
                              background: currentPage === idx + 1 ? '#64748b' : 'white',
                              color: currentPage === idx + 1 ? 'white' : '#64748b',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              minWidth: '40px'
                            }}
                          >
                            {idx + 1}
                          </button>
                        ))}
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
                            transition: 'all 0.2s ease'
                          }}
                        >
                          ถัดไป
                        </button>
                      </div>
                    )}

                    {/* Loading indicator */}
                    {loading && (
                      <div style={{ textAlign: 'center', margin: '16px', color: '#64748b', fontSize: '0.95rem' }}>
                        กำลังโหลดข้อมูล...
                      </div>
                    )}
                  </TableContainer>
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
                      <UserSelect value={selectedChatUser || ""} onChange={handleUserSelect}>
                        <option value="">-- Select User to Chat --</option>
                        <option value="announcement">
                          📢 Announcement to All Members
                        </option>
                        {chatUsers.map((chatUser) => (
                          <option key={chatUser.user_id} value={chatUser.user_id}>
                            {chatUser.name}
                          </option>
                        ))}
                      </UserSelect>
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
                            <MessageBubble key={msg.id} $isAdmin={msg.sender_type === 'admin'}>
                              <MessageSender $isAdmin={msg.sender_type === 'admin'}>
                                {msg.sender_type === 'admin'
                                  ? 'Admin'
                                  : chatUsers.find(u => u.user_id === msg.user_id)?.name || 'User'}
                              </MessageSender>
                              <div>{msg.message}</div>
                              <MessageTimeStyled $isAdmin={msg.sender_type === 'admin'}>
                                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                              </MessageTimeStyled>
                            </MessageBubble>
                          ))}
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
                    notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        $unread={!notification.read}
                      >
                        <NotificationContent>
                          {notification.message &&
                            typeof notification.message === "string" &&
                            notification.message.includes("New message from") ? (
                            <>
                              <span style={{ fontWeight: "bold", marginBottom: "4px", display: "block" }}>
                                New Message 📩 from{" "}
                                {notification.message
                                  .split(" from ")[1]
                                  ?.split(" for ticket")[0] || "Unknown"}
                              </span>
                              <span style={{ background: "#f0f4f8", padding: "8px", borderRadius: "4px", display: "block" }}>
                                {notification.message.split(": ").slice(1).join(": ")}
                              </span>
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
                {editError && (
                  <div style={{ color: '#ef4444', textAlign: 'center', margin: '8px' }}>{editError}</div>
                )}
                {editSuccess && (
                  <div style={{ color: '#10b981', textAlign: 'center', margin: '8px' }}>{editSuccess}</div>
                )}
              </Container>
            </MainContent>
          </>
        ) : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;

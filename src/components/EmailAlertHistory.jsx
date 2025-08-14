import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:5004';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: #1f2937;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const BackButton = styled.button`
  background: #6b7280;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #4b5563;
    transform: translateY(-1px);
  }
`;

const RefreshButton = styled.button`
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const AlertTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.thead`
  background: #f9fafb;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #f9fafb;
  }
  
  &:hover {
    background: #f3f4f6;
  }
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
`;

const TableHeaderCell = styled.th`
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  
  ${props => props.status === 'sent' && `
    background: #dcfce7;
    color: #166534;
  `}
  
  ${props => props.status === 'failed' && `
    background: #fef2f2;
    color: #dc2626;
  `}
  
  ${props => props.status === 'pending' && `
    background: #fef3c7;
    color: #d97706;
  `}
`;

const TypeBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  
  ${props => props.type === 'new_ticket' && `
    background: #dbeafe;
    color: #1d4ed8;
  `}
  
  ${props => props.type === 'overdue_ticket' && `
    background: #fed7d7;
    color: #c53030;
  `}
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  
  &::after {
    content: '';
    width: 24px;
    height: 24px;
    border: 2px solid #f3f4f6;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #6b7280;
`;

const EmailAlertHistory = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: 1,
        per_page: 50,
        ...(filters.status && { status: filters.status }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      });

      const response = await axios.get(`${API_BASE_URL}/api/simple-email-alerts?${params}`);

      setAlerts(response.data.alerts || []);
    } catch (err) {
      console.error('Error fetching email alerts:', err);
      setError('ไม่สามารถโหลดประวัติ email alerts ได้');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'new_ticket':
        return 'Ticket ใหม่';
      case 'overdue_ticket':
        return 'Ticket ค้าง';
      default:
        return type;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'sent':
        return 'ส่งแล้ว';
      case 'failed':
        return 'ส่งไม่สำเร็จ';
      case 'pending':
        return 'รอส่ง';
      default:
        return status;
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/')}>
          ← กลับหน้าหลัก
        </BackButton>
        <Title>📧 Email Alert History</Title>
        <RefreshButton onClick={fetchAlerts} disabled={loading}>
          {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
        </RefreshButton>
      </Header>

      <FilterContainer>
        <FilterSelect
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="">ทุกประเภท</option>
          <option value="new_ticket">Ticket ใหม่</option>
          <option value="overdue_ticket">Ticket ค้าง</option>
        </FilterSelect>

        <FilterSelect
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">ทุกสถานะ</option>
          <option value="sent">ส่งแล้ว</option>
          <option value="failed">ส่งไม่สำเร็จ</option>
          <option value="pending">รอส่ง</option>
        </FilterSelect>
      </FilterContainer>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <LoadingSpinner />
      ) : alerts.length === 0 ? (
        <EmptyState>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📭</div>
          <div>ไม่มีประวัติ Email Alerts</div>
        </EmptyState>
      ) : (
        <AlertTable>
          <TableHeader>
            <tr>
              <TableHeaderCell>วันที่ส่ง</TableHeaderCell>
              <TableHeaderCell>ประเภท</TableHeaderCell>
              <TableHeaderCell>Ticket ID</TableHeaderCell>
              <TableHeaderCell>ผู้รับ</TableHeaderCell>
              <TableHeaderCell>หัวข้อ</TableHeaderCell>
              <TableHeaderCell>สถานะ</TableHeaderCell>
            </tr>
          </TableHeader>
          <tbody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>{formatDate(alert.sent_at)}</TableCell>
                <TableCell>
                  <TypeBadge type={alert.alert_type}>
                    {getTypeLabel(alert.alert_type)}
                  </TypeBadge>
                </TableCell>
                <TableCell>{alert.ticket_id}</TableCell>
                <TableCell>
                  <div>{alert.recipient_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {alert.recipient_email}
                  </div>
                </TableCell>
                <TableCell title={alert.subject}>
                  {alert.subject.length > 50 
                    ? `${alert.subject.substring(0, 50)}...` 
                    : alert.subject
                  }
                </TableCell>
                <TableCell>
                  <StatusBadge status={alert.status}>
                    {getStatusLabel(alert.status)}
                  </StatusBadge>
                  {alert.error_message && (
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '4px' }}>
                      {alert.error_message}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </AlertTable>
      )}
    </Container>
  );
};

export default EmailAlertHistory;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// Styled Components
const PageContainer = styled.div`
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #1e293b;
  font-size: 2rem;
  font-weight: 700;
`;

const BackButton = styled.button`
  padding: 10px 20px;
  background: #475569;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: #334155;
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterInput = styled.input`
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  min-width: 200px;
`;

const DateInput = styled.input`
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
`;

const Th = styled.th`
  background: #f8fafc;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
`;

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  
  ${props => {
    switch (props.status) {
      case 'New':
        return `
          background-color: #e0f2fe;
          color: #0369a1;
          border: 1px solid #bae6fd;
        `;
      case 'In Process':
        return `
          background-color: #e0e7ff;
          color: #4338ca;
          border: 1px solid #c7d2fe;
        `;
      case 'Pending':
        return `
          background-color: #fffbeb;
          color: #b45309;
          border: 1px solid #fde68a;
        `;
      case 'Closed':
        return `
          background-color: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        `;
      case 'Cancelled':
        return `
          background-color: #f9fafb;
          color: #4b5563;
          border: 1px solid #e5e7eb;
        `;
      case 'Reject':
        return `
          background-color: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        `;
      default:
        return `
          background-color: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
        `;
    }
  }}
`;

const NoData = styled.div`
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-size: 1.1rem;
`;

function StatusLogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTicketId, setFilterTicketId] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://backend-oa-pqy2.onrender.com/api/log-status-change', {
        params: { ticket_id: filterTicketId }
      });
      setLogs(response.data);
      setError(null);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล log');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtering logic
  const filteredLogs = logs.filter(log => {
    const ticketIdMatch = filterTicketId === '' || String(log.ticket_id).includes(filterTicketId);
    const dateMatch = filterDate === '' || (log.changed_at && log.changed_at.startsWith(filterDate));
    return ticketIdMatch && dateMatch;
  });

  return (
    <PageContainer>
      <Header>
        <Title>Ticket Status Change Logs</Title>
        <BackButton onClick={() => navigate(-1)}>&larr; กลับ</BackButton>
      </Header>
      <FilterSection>
        <FilterInput
          type="text"
          placeholder="ค้นหา Ticket ID..."
          value={filterTicketId}
          onChange={e => setFilterTicketId(e.target.value)}
        />
        <DateInput
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
        />
      </FilterSection>
      {loading ? (
        <NoData>กำลังโหลดข้อมูล...</NoData>
      ) : error ? (
        <NoData>{error}</NoData>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Ticket ID</Th>
              <Th>Old Status</Th>
              <Th>New Status</Th>
              <Th>Changed By</Th>
              <Th>Timestamp</Th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr><Td colSpan={5}><NoData>ไม่พบข้อมูล</NoData></Td></tr>
            ) : (
              filteredLogs.map((log, idx) => (
                <tr key={log.id || idx}>
                  <Td>{log.ticket_id}</Td>
                  <Td>
                    <StatusBadge status={log.old_status}>{log.old_status}</StatusBadge>
                  </Td>
                  <Td>
                    <StatusBadge status={log.new_status}>{log.new_status}</StatusBadge>
                  </Td>
                  <Td>{log.changed_by}</Td>
                  <Td>{new Date(log.changed_at).toLocaleString('th-TH')}</Td>
                </tr>
              ))
            )}
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <Td>{log.ticket_id}</Td>
                <Td>
                  <StatusBadge status={log.old_status}>
                    {log.old_status}
                  </StatusBadge>
                </Td>
                <Td>
                  <StatusBadge status={log.new_status}>
                    {log.new_status}
                  </StatusBadge>
                </Td>
                <Td>{log.changed_by}</Td>
                <Td>
                  {new Date(log.changed_at).toLocaleString('th-TH')}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </PageContainer>
  );
}

export default StatusLogsPage;
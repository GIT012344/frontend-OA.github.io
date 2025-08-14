import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchAllStatusLogs } from './api';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// --- Constants & Helper Functions ---
const LOCAL_TYPE_GROUP_KEY = 'oa_type_group_subgroup';
// Retrieve the latest type-group-subgroup mapping stored by the admin page
const getTypeGroupSubgroup = () => {
  try {
    const raw = localStorage.getItem(LOCAL_TYPE_GROUP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse type/group mapping from localStorage', err);
  }
  return {}; // fallback empty object
};



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
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [ticketMap, setTicketMap] = useState({});
  const [typeGroupMapping, setTypeGroupMapping] = useState(getTypeGroupSubgroup());

 
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticketIdFromUrl = params.get('ticket_id');
    if (ticketIdFromUrl) {
      setFilterTicketId(ticketIdFromUrl);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    
  }, []);

  // --- Listen for type/group data updates from AdminTypeGroupManager -----
  useEffect(() => {
    const handleTypeGroupUpdate = (event) => {
      console.log('[StatusLogsPage] Type/Group data updated, refreshing categories...', event.detail);
      const newMapping = getTypeGroupSubgroup(); // Re-read from localStorage
      setTypeGroupMapping(newMapping);
      
      // Update categories to include new type names
      setCategories(prevCategories => {
        const catSet = new Set(prevCategories);
        Object.keys(newMapping).forEach(typeName => {
          if (typeName) catSet.add(typeName);
        });
        return [...catSet];
      });
    };
    
    window.addEventListener('typeGroupDataUpdated', handleTypeGroupUpdate);
    return () => window.removeEventListener('typeGroupDataUpdated', handleTypeGroupUpdate);
  }, []);

  
  useEffect(() => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:5004';
    axios.get(`${API_BASE_URL}/api/data`)
      .then(res => {
        if (!Array.isArray(res.data)) return;
        const m = {};
        const catSet = new Set();
        res.data.forEach(t => {
          const key = (t["Ticket ID"] || '').toString().trim().toLowerCase();
          m[key] = t;
          const typeVal = (t.type || '').trim();
          if (typeVal) catSet.add(typeVal);
        });
        // Also include type names defined in the admin mapping (keys of the object in localStorage)
        Object.keys(typeGroupMapping).forEach(typeName => {
          if (typeName) catSet.add(typeName);
        });

        setTicketMap(m);
        setCategories([...catSet]);
      })
      .catch(err => console.error('Ticket metadata fetch error', err));
  }, );


  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllStatusLogs();
      const dataArr = Array.isArray(data) ? data : [];
      setLogs(dataArr);
      // Optionally derive categories from logs if they store type names
      const deriveCat = l => (l.category || '').trim();
      const uniqueCats = [...new Set(dataArr.map(deriveCat).filter(Boolean))];
      setCategories(prev => [...new Set([...prev, ...uniqueCats])]);
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });
      
      let errorMessage = 'เกิดข้อผิดพลาดในการดึงข้อมูล';
      if (err.response?.status === 404) {
        errorMessage = 'ไม่พบข้อมูลในระบบ';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่';
      }
      
      setError(errorMessage);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  
  // ----- Pre-compute date boundaries -----
  const startBoundary = startDate ? new Date(startDate) : null;
  if (startBoundary) startBoundary.setHours(0, 0, 0, 0);
  const endBoundary = endDate ? new Date(endDate) : null;
  if (endBoundary) endBoundary.setHours(23, 59, 59, 999);

  const filteredLogs = logs.filter(log => {
    if (!log) return false;
    
    const ticketIdMatch = !filterTicketId || 
      (log.ticket_id && String(log.ticket_id).includes(filterTicketId));
    
    // Build date-only objects for reliable comparison
    const logDateObj = log.changed_at ? new Date(log.changed_at) : null;
    const logMidnight = logDateObj ? new Date(logDateObj.getFullYear(), logDateObj.getMonth(), logDateObj.getDate()) : null;

    const startMatch = !startBoundary || (logMidnight && logMidnight >= startBoundary);
    const endMatch = !endBoundary || (logMidnight && logMidnight <= endBoundary);
    const statusMatch = !statusFilter || log.new_status === statusFilter;
    const ticketIdKey = (log.ticket_id || '').toString().trim().toLowerCase();
    const filterVal = (categoryFilter || '').trim().toLowerCase();
    const ticket = ticketMap[ticketIdKey];
    const typeCandidates = [
      ticket?.type,
      ticket?.Type,
      ticket?.type_main,
      ticket?.Type_main,
      ticket?.type_group,
      ticket?.Type_group,
      ticket?.group,
      ticket?.Group,
      (log.category || '').trim()
    ].map(x => (x || '').trim().toLowerCase());
    const categoryMatch = !categoryFilter || typeCandidates.includes(filterVal);

    const dateMatch = startMatch && endMatch;
    
    return ticketIdMatch && dateMatch && statusMatch && categoryMatch;
  });

  // เรียงลำดับข้อมูลตามเวลาใหม่ไปเก่า
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    return new Date(b.changed_at) - new Date(a.changed_at);
  });

  // ---------- Export CSV with Thai Language Support ---------- //
  function exportCsv() {
    if (sortedLogs.length === 0) {
      alert('ไม่มีข้อมูลสำหรับ Export');
      return;
    }
    
    // Use Thai headers for better readability
    const headers = ['รหัส Ticket', 'สถานะเดิม', 'สถานะใหม่', 'ผู้เปลี่ยน', 'วันที่เปลี่ยน', 'หมายเหตุ', 'รายละเอียดเพิ่มเติม'];
    
    const rows = sortedLogs.map(l => [
      l.ticket_id || '',
      l.old_status || '',
      l.new_status || '',
      l.changed_by || '',
      l.changed_at ? new Date(l.changed_at).toLocaleString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }) : '',
      (l.note || '').replace(/\n/g, ' ').replace(/,/g, ';'),
      (l.remarks || '').replace(/\n/g, ' ').replace(/,/g, ';')
    ]);
    
    // Create CSV content with proper escaping
    const csvContent = [headers, ...rows]
      .map(row => row.map(value => {
        // Properly escape quotes and wrap in quotes
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(','))
      .join('\r\n'); // Use Windows line endings for better Excel compatibility
    
    // Add BOM (Byte Order Mark) for proper Thai character display in Excel
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;
    
    // Create blob with proper MIME type and encoding
    const blob = new Blob([csvWithBOM], {
      type: 'text/csv;charset=utf-8;'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with Thai-friendly timestamp
    const now = new Date();
    const timestamp = now.toISOString().split('T')[0].replace(/-/g, '');
    link.setAttribute('download', `ประวัติการเปลี่ยนสถานะ_${timestamp}.csv`);
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    // Show success message
    alert('Export CSV สำเร็จ! ไฟล์จะแสดงภาษาไทยได้ถูกต้องใน Excel');
  }

  return (
    <PageContainer>
      <Header>
        <Title>ประวัติการเปลี่ยนสถานะ</Title>
        <BackButton onClick={() => navigate(-1)}>&larr; กลับ</BackButton>
      </Header>
      
      <FilterSection>
        <FilterInput
          type="text"
          placeholder="ระบุ Ticket ID..."
          value={filterTicketId}
          onChange={e => setFilterTicketId(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && fetchLogs()}
        />
        <DateInput
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          title="เริ่มวันที่"
        />
        <DateInput
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          title="ถึงวันที่"
        />
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'8px'}}>
          <option value="">ทุกสถานะ</option>
          <option value="New">New</option>
          <option value="In Process">In Process</option>
          <option value="Pending">Pending</option>
          <option value="Closed">Closed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Reject">Reject</option>
        </select>
        <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} style={{padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:'8px'}}> 
          <option value="">ทุกประเภท</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
          
        </select>
        <button onClick={exportCsv} style={{padding:'8px 16px',background:'#475569',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer'}}>Export CSV</button>
      </FilterSection>
      
      {loading ? (
        <NoData>กำลังโหลดข้อมูล...</NoData>
      ) : error ? (
        <NoData>{error}</NoData>
      ) : sortedLogs.length === 0 ? (
        <NoData>ไม่พบข้อมูล</NoData>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Ticket ID</Th>
              <Th>สถานะเดิม</Th>
              <Th>สถานะใหม่</Th>
              <Th>ผู้ดำเนินการ</Th>
              <Th>วันที่/เวลา</Th>
              <Th>หมายเหตุ</Th>
              <Th>หมายเหตุเพิ่มเติม</Th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.map((log, idx) => (
              <tr key={log.id || idx}>
                <Td>{log.ticket_id}</Td>
                <Td>
                  <StatusBadge status={log.old_status}>
                    {log.old_status || '-'}
                  </StatusBadge>
                </Td>
                <Td>
                  <StatusBadge status={log.new_status}>
                    {log.new_status || '-'}
                  </StatusBadge>
                </Td>
                <Td>{log.changed_by || '-'}</Td>
                <Td>
                  {log.changed_at ? 
                    new Date(log.changed_at).toLocaleString('th-TH', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    }) : 
                    '-'}
                </Td>
                <Td>{log.note || '-'}</Td>
                <Td>{log.remarks || '-'}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </PageContainer>
  );
}

export default StatusLogsPage;
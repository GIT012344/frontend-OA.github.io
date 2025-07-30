import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { activityAPI } from '../utils/api';
import AuthManager from '../utils/auth';

// Styled Components
const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;
  
  h1 {
    color: #1e293b;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 8px;
    
    @media (max-width: 768px) {
      font-size: 1.6rem;
    }
  }
  
  p {
    color: #64748b;
    font-size: 1rem;
  }
`;

const FiltersContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  
  label {
    font-weight: 600;
    color: #374151;
    margin-bottom: 6px;
    font-size: 0.9rem;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  color: #1e293b;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #64748b;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.1);
  }
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  color: #1e293b;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #64748b;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.1);
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #475569 0%, #64748b 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(71, 85, 105, 0.25);
  }
  
  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
    
    @media (max-width: 768px) {
      padding: 12px 8px;
      font-size: 0.85rem;
    }
  }
  
  th {
    background: #f8fafc;
    font-weight: 600;
    color: #374151;
    font-size: 0.9rem;
    
    @media (max-width: 768px) {
      font-size: 0.8rem;
    }
  }
  
  td {
    color: #1e293b;
    font-size: 0.9rem;
  }
  
  tr:hover {
    background: #f8fafc;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  
  ${props => {
    switch (props.status) {
      case 'success':
        return `
          background: #dcfce7;
          color: #166534;
        `;
      case 'failed':
        return `
          background: #fef2f2;
          color: #dc2626;
        `;
      default:
        return `
          background: #f1f5f9;
          color: #64748b;
        `;
    }
  }}
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
`;

const PaginationInfo = styled.span`
  color: #64748b;
  font-size: 0.9rem;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PaginationButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
  
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f3f4f6;
    border-top: 3px solid #64748b;
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
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  text-align: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
  
  h3 {
    margin-bottom: 8px;
    color: #374151;
  }
`;

// Main Component
const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    actionType: '',
    dateFrom: '',
    dateTo: '',
    username: ''
  });

  useEffect(() => {
    // Check if user has admin access
    const user = AuthManager.getCurrentUser();
    if (!user || user.role !== 'admin') {
      setError('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      return;
    }

    loadActivityLogs();
  }, [currentPage]);

  const loadActivityLogs = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await activityAPI.getActivityLogs(currentPage, 20, filters);

      if (result.success) {
        setLogs(result.logs);
        setTotalPages(Math.ceil(result.pagination.total / result.pagination.per_page));
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Failed to load activity logs:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadActivityLogs();
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionTypeText = (actionType) => {
    const actionTypes = {
      'login_success': 'เข้าสู่ระบบ',
      'login_failed': 'เข้าสู่ระบบไม่สำเร็จ',
      'logout': 'ออกจากระบบ',
      'create_ticket': 'สร้าง Ticket',
      'update_ticket': 'แก้ไข Ticket',
      'delete_ticket': 'ลบ Ticket',
      'pin_verification_success': 'ยืนยัน PIN สำเร็จ',
      'pin_verification_failed': 'ยืนยัน PIN ไม่สำเร็จ'
    };
    return actionTypes[actionType] || actionType;
  };

  const getStatusFromAction = (actionType) => {
    if (actionType.includes('failed')) return 'failed';
    if (actionType.includes('success') || actionType === 'logout' || actionType === 'create_ticket') return 'success';
    return 'default';
  };

  if (error && !logs.length) {
    return (
      <Container>
        <Header>
          <h1>ประวัติการใช้งาน</h1>
        </Header>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>ประวัติการใช้งาน</h1>
        <p>ติดตามและตรวจสอบกิจกรรมของผู้ใช้ในระบบ</p>
      </Header>

      <FiltersContainer>
        <FiltersGrid>
          <FilterGroup>
            <label>ประเภทการกระทำ</label>
            <Select
              name="actionType"
              value={filters.actionType}
              onChange={handleFilterChange}
            >
              <option value="">ทุกประเภท</option>
              <option value="login_success">เข้าสู่ระบบ</option>
              <option value="login_failed">เข้าสู่ระบบไม่สำเร็จ</option>
              <option value="create_ticket">สร้าง Ticket</option>
              <option value="logout">ออกจากระบบ</option>
              <option value="pin_verification_success">ยืนยัน PIN สำเร็จ</option>
              <option value="pin_verification_failed">ยืนยัน PIN ไม่สำเร็จ</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <label>ชื่อผู้ใช้</label>
            <Input
              type="text"
              name="username"
              value={filters.username}
              onChange={handleFilterChange}
              placeholder="ค้นหาชื่อผู้ใช้"
            />
          </FilterGroup>

          <FilterGroup>
            <label>วันที่เริ่มต้น</label>
            <Input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
            />
          </FilterGroup>

          <FilterGroup>
            <label>วันที่สิ้นสุด</label>
            <Input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
            />
          </FilterGroup>
        </FiltersGrid>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
          </Button>
        </div>
      </FiltersContainer>

      <TableContainer>
        {loading ? (
          <LoadingContainer>
            <div className="spinner"></div>
          </LoadingContainer>
        ) : logs.length === 0 ? (
          <EmptyState>
            <h3>ไม่พบข้อมูล</h3>
            <p>ไม่มีประวัติการใช้งานที่ตรงกับเงื่อนไขการค้นหา</p>
          </EmptyState>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th>วันที่/เวลา</th>
                  <th>ผู้ใช้</th>
                  <th>การกระทำ</th>
                  <th>รายละเอียด</th>
                  <th>IP Address</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index}>
                    <td>{formatDateTime(log.timestamp)}</td>
                    <td>{log.username || '-'}</td>
                    <td>{getActionTypeText(log.action_type)}</td>
                    <td>{log.details || '-'}</td>
                    <td>{log.ip_address || '-'}</td>
                    <td>
                      <StatusBadge status={getStatusFromAction(log.action_type)}>
                        {getStatusFromAction(log.action_type) === 'success' ? 'สำเร็จ' : 
                         getStatusFromAction(log.action_type) === 'failed' ? 'ไม่สำเร็จ' : '-'}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Pagination>
              <PaginationInfo>
                หน้า {currentPage} จาก {totalPages} ({logs.length} รายการ)
              </PaginationInfo>
              
              <PaginationButtons>
                <PaginationButton
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ก่อนหน้า
                </PaginationButton>
                <PaginationButton
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  ถัดไป
                </PaginationButton>
              </PaginationButtons>
            </Pagination>
          </>
        )}
      </TableContainer>
    </Container>
  );
};

export default ActivityLogs;

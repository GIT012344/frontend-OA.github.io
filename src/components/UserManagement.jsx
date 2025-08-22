import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE || '';

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

const AddButton = styled.button`
  padding: 8px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  
  &:hover {
    background: #059669;
  }
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
  margin-bottom: 20px;

  &:hover {
    background: #4b5563;
    transform: translateY(-1px);
  }
`;



const UsersTable = styled.table`
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

const RoleBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  
  ${props => props.role === 'admin' && `
    background: #fef3c7;
    color: #d97706;
  `}
  
  ${props => props.role === 'user' && `
    background: #dbeafe;
    color: #1d4ed8;
  `}
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  
  ${props => props.active ? `
    background: #dcfce7;
    color: #166534;
  ` : `
    background: #f3f4f6;
    color: #6b7280;
  `}
`;

const ActionButton = styled.button`
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  margin-right: 8px;
  
  &:hover {
    background: #f9fafb;
  }
  
  &.edit {
    color: #3b82f6;
    border-color: #3b82f6;
  }
  
  &.permissions {
    color: #7c3aed;
    border-color: #7c3aed;
  }
  
  &.delete {
    color: #dc2626;
    border-color: #dc2626;
  }
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

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('ไม่สามารถโหลดรายการผู้ใช้ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = () => {

  };

  const handleEdit = (user) => {

  };

  const handlePermissions = (user) => {

  };

  const handleDelete = async (userId) => {
    if (!window.confirm('คุณต้องการลบผู้ใช้นี้หรือไม่?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('ไม่สามารถลบผู้ใช้ได้');
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'user': return 'ผู้ใช้งาน';
      default: return role;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  return (
    <Container>
      <BackButton onClick={() => navigate('/')}>
        ← กลับหน้าหลัก
      </BackButton>
      <Header>
        <Title>👥 จัดการผู้ใช้</Title>
        <AddButton onClick={handleAdd}>+ เพิ่มผู้ใช้</AddButton>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <EmptyState>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👥</div>
          <div>ไม่มีผู้ใช้ในระบบ</div>
        </EmptyState>
      ) : (
        <UsersTable>
          <TableHeader>
            <tr>
              <TableHeaderCell>ชื่อผู้ใช้</TableHeaderCell>
              <TableHeaderCell>อีเมล</TableHeaderCell>
              <TableHeaderCell>ชื่อเต็ม</TableHeaderCell>
              <TableHeaderCell>บทบาท</TableHeaderCell>
              <TableHeaderCell>สถานะ</TableHeaderCell>
              <TableHeaderCell>วันที่สร้าง</TableHeaderCell>
              <TableHeaderCell>จัดการ</TableHeaderCell>
            </tr>
          </TableHeader>
          <tbody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell><strong>{user.username}</strong></TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.full_name || '-'}</TableCell>
                <TableCell>
                  <RoleBadge role={user.role}>
                    {getRoleLabel(user.role)}
                  </RoleBadge>
                </TableCell>
                <TableCell>
                  <StatusBadge active={user.is_active !== false}>
                    {user.is_active !== false ? 'ใช้งาน' : 'ปิดใช้งาน'}
                  </StatusBadge>
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>
                  <ActionButton className="edit" onClick={() => handleEdit(user)}>
                    แก้ไข
                  </ActionButton>
                  <ActionButton className="permissions" onClick={() => handlePermissions(user)}>
                    สิทธิ์
                  </ActionButton>
                  <ActionButton className="delete" onClick={() => handleDelete(user.id)}>
                    ลบ
                  </ActionButton>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </UsersTable>
      )}
    </Container>
  );
};

export default UserManagement;

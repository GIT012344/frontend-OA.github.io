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

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
`;

const TemplateCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const TemplateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const TemplateType = styled.div`
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
`;

const TemplateActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  
  &:hover {
    background: #f9fafb;
  }
  
  &.edit {
    color: #3b82f6;
    border-color: #3b82f6;
  }
  
  &.delete {
    color: #dc2626;
    border-color: #dc2626;
  }
`;

const TemplateContent = styled.div`
  margin-bottom: 15px;
`;

const SubjectPreview = styled.div`
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  font-size: 0.875rem;
`;

const BodyPreview = styled.div`
  color: #6b7280;
  font-size: 0.75rem;
  line-height: 1.4;
  max-height: 60px;
  overflow: hidden;
`;

const StatusBadge = styled.span`
  padding: 2px 6px;
  border-radius: 8px;
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

const BackButton = styled.button`
  padding: 8px 16px;
  background: #f9fafb;
  color: #6b7280;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 20px;
`;

const EmailTemplateManager = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/email-templates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setTemplates(response.data || []);
    } catch (err) {
      console.error('Error fetching email templates:', err);
      setError('ไม่สามารถโหลด email templates ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const getTypeLabel = (type) => {
    switch (type) {
      case 'new_ticket':
        return '📧 Template สำหรับ Ticket ใหม่';
      case 'overdue_ticket':
        return '⏰ Template สำหรับ Ticket ค้าง';
      default:
        return type;
    }
  };

  const handleEdit = (template) => {
    // TODO: Open edit modal
    console.log('Edit template:', template);
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm('คุณต้องการลบ template นี้หรือไม่?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/email-templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      await fetchTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('ไม่สามารถลบ template ได้');
    }
  };

  const handleAdd = () => {
    // TODO: Open add modal
    console.log('Add new template');
  };

  return (
    <Container>
      <BackButton onClick={() => navigate('/')}>
        ← กลับหน้าหลัก
      </BackButton>
      <Header>
        <Title>📝 จัดการ Email Templates</Title>
        <AddButton onClick={handleAdd}>
          + เพิ่ม Template
        </AddButton>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <LoadingSpinner />
      ) : templates.length === 0 ? (
        <EmptyState>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📝</div>
          <div>ไม่มี Email Templates</div>
          <div style={{ fontSize: '0.875rem', marginTop: '8px' }}>
            คลิก "เพิ่ม Template" เพื่อสร้าง template ใหม่
          </div>
        </EmptyState>
      ) : (
        <TemplateGrid>
          {templates.map((template) => (
            <TemplateCard key={template.id}>
              <TemplateHeader>
                <TemplateType>
                  {getTypeLabel(template.template_type)}
                </TemplateType>
                <TemplateActions>
                  <ActionButton 
                    className="edit" 
                    onClick={() => handleEdit(template)}
                  >
                    แก้ไข
                  </ActionButton>
                  <ActionButton 
                    className="delete" 
                    onClick={() => handleDelete(template.id)}
                  >
                    ลบ
                  </ActionButton>
                </TemplateActions>
              </TemplateHeader>

              <TemplateContent>
                <SubjectPreview>
                  <strong>หัวข้อ:</strong> {template.subject_template}
                </SubjectPreview>
                <BodyPreview>
                  <strong>เนื้อหา:</strong> {template.body_template}
                </BodyPreview>
              </TemplateContent>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <StatusBadge active={template.is_active}>
                  {template.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                </StatusBadge>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  อัปเดต: {new Date(template.updated_at).toLocaleDateString('th-TH')}
                </div>
              </div>
            </TemplateCard>
          ))}
        </TemplateGrid>
      )}
    </Container>
  );
};

export default EmailTemplateManager;

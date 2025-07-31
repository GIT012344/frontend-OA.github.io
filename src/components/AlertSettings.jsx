import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: #1f2937;
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 600;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-bottom: 20px;
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
`;

const SettingDescription = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: #10b981;
  }
  
  &:checked + span:before {
    transform: translateX(20px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.2s;
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.2s;
    border-radius: 50%;
  }
`;

const NumberInput = styled.input`
  width: 80px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  text-align: center;
  margin-left: 12px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
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

const SaveButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s;
  margin-top: 20px;

  &:hover {
    background: #059669;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const TestButton = styled.button`
  padding: 8px 16px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  margin-left: 12px;
  
  &:hover {
    background: #d97706;
  }
`;

const Message = styled.div`
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  
  &.error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
  }
  
  &.success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
  }
`;

const AlertSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    new_ticket_alerts_enabled: true,
    overdue_alerts_enabled: true,
    overdue_threshold_days: 3
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://backend-oa-pqy2.onrender.com/api/alert-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data && response.data.length > 0) {
        const data = response.data[0];
        setSettings({
          new_ticket_alerts_enabled: data.new_ticket_alerts_enabled || false,
          overdue_alerts_enabled: data.overdue_alerts_enabled || false,
          overdue_threshold_days: data.overdue_threshold_days || 3
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      try {
        await axios.put('https://backend-oa-pqy2.onrender.com/api/alert-settings', settings, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
      } catch {
        await axios.post('https://backend-oa-pqy2.onrender.com/api/alert-settings', settings, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
      }

      setMessage({ type: 'success', text: 'บันทึกการตั้งค่าเรียบร้อยแล้ว' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'ไม่สามารถบันทึกการตั้งค่าได้' });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('https://backend-oa-pqy2.onrender.com/api/test-overdue-alerts', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'ทดสอบการส่ง alerts เรียบร้อยแล้ว' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'ไม่สามารถทดสอบการส่ง alerts ได้' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <BackButton onClick={() => navigate('/')}>
        ← กลับหน้าหลัก
      </BackButton>
      <Title>⚙️ ตั้งค่าการแจ้งเตือน</Title>

      {message.text && (
        <Message className={message.type}>{message.text}</Message>
      )}

      <Card>
        <SettingRow>
          <SettingInfo>
            <SettingLabel>แจ้งเตือน Ticket ใหม่</SettingLabel>
            <SettingDescription>ส่ง email เมื่อมี ticket ใหม่</SettingDescription>
          </SettingInfo>
          <Toggle>
            <ToggleInput
              type="checkbox"
              checked={settings.new_ticket_alerts_enabled}
              onChange={(e) => setSettings(prev => ({ ...prev, new_ticket_alerts_enabled: e.target.checked }))}
            />
            <ToggleSlider />
          </Toggle>
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingLabel>แจ้งเตือน Ticket ค้าง</SettingLabel>
            <SettingDescription>ส่ง email เมื่อ ticket ค้างนานเกินกำหนด</SettingDescription>
          </SettingInfo>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={settings.overdue_alerts_enabled}
                onChange={(e) => setSettings(prev => ({ ...prev, overdue_alerts_enabled: e.target.checked }))}
              />
              <ToggleSlider />
            </Toggle>
            <NumberInput
              type="number"
              min="1"
              value={settings.overdue_threshold_days}
              onChange={(e) => setSettings(prev => ({ ...prev, overdue_threshold_days: parseInt(e.target.value) || 1 }))}
            />
            <span style={{ marginLeft: '8px', fontSize: '0.875rem', color: '#6b7280' }}>วัน</span>
          </div>
        </SettingRow>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <TestButton onClick={handleTest} disabled={loading}>
          {loading ? 'กำลังทดสอบ...' : 'ทดสอบ Overdue Alerts'}
        </TestButton>
        <SaveButton onClick={handleSave} disabled={loading}>
          {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </SaveButton>
      </div>
    </Container>
  );
};

export default AlertSettings;

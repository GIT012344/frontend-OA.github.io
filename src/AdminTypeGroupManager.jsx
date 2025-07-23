import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LOCAL_KEY = 'oa_type_group_subgroup';
// Backend API base (change if backend runs elsewhere)
const API_BASE = process.env.REACT_APP_API_BASE || 'https://backend-oa-pqy2.onrender.com';

function getInitialData() {
  const raw = localStorage.getItem(LOCAL_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return { Service: {}, Helpdesk: {} };
}

function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed', top: 32, right: 32, zIndex: 9999,
      background: 'rgba(34,197,94,0.95)', color: 'white', padding: '16px 32px', borderRadius: 16,
      fontWeight: 600, fontSize: '1.1rem', boxShadow: '0 4px 24px #22c55e55', display: 'flex', alignItems: 'center', gap: 12,
      animation: 'slideIn 0.5s',
    }}>
      <span style={{fontSize:24}}>✅</span> {message}
      <button onClick={onClose} style={{marginLeft:16, background:'none', border:'none', color:'white', fontSize:20, cursor:'pointer'}}>×</button>
      <style>{`@keyframes slideIn{from{transform:translateY(-40px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}

const glass = {
  background: 'rgba(255,255,255,0.85)',
  boxShadow: '0 8px 32px #0002',
  borderRadius: 20,
  padding: 28,
  marginBottom: 32,
  minHeight: 200,
  backdropFilter: 'blur(8px)',
  border: '1.5px solid #e0e7ef',
  transition: 'box-shadow 0.2s',
};
const input = {
  padding: '14px 18px',
  borderRadius: 12,
  border: '1.5px solid #dbeafe',
  fontSize: '1.08rem',
  marginRight: 10,
  marginBottom: 8,
  outline: 'none',
  background: 'rgba(243,246,255,0.9)',
  transition: 'border 0.2s',
  boxShadow: '0 2px 8px #3b82f611',
};
const addBtn = {
  padding: '12px 20px',
  borderRadius: 50,
  border: 'none',
  background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
  color: 'white',
  fontWeight: 700,
  fontSize: '1.1rem',
  cursor: 'pointer',
  marginLeft: 0,
  marginBottom: 8,
  boxShadow: '0 2px 12px #6366f144',
  transition: 'background 0.2s, box-shadow 0.2s',
  display: 'flex', alignItems: 'center', gap: 8,
};
const delBtn = {
  ...addBtn,
  background: 'linear-gradient(90deg, #ef4444 0%, #f59e42 100%)',
  color: 'white',
  padding: '10px 18px',
  fontSize: '1rem',
  marginLeft: 10,
  marginBottom: 0,
};
const selected = {
  background: 'linear-gradient(90deg, #f0f9ff 0%, #e0e7ff 100%)',
  color: '#2563eb',
  fontWeight: 800,
  borderRadius: 10,
  padding: '6px 12px',
  boxShadow: '0 2px 8px #38bdf833',
  border: '1.5px solid #bae6fd',
};
const listItem = {
  display: 'flex', alignItems: 'center', marginBottom: 10, padding: '4px 0',
  borderRadius: 8, transition: 'background 0.15s',
};
const icon = {
  fontSize: 18, marginRight: 8, opacity: 0.7,
};
const sectionTitle = {
  color: '#0ea5e9', fontWeight: 800, fontSize: '1.2rem', marginBottom: 18, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 8,
};
const empty = {
  color: '#b0b7c3', fontStyle: 'italic', margin: '18px 0', textAlign: 'center',
};

export default function AdminTypeGroupManager() {
  const [data, setData] = useState(getInitialData());
  const [typeInput, setTypeInput] = useState('');
  const [groupInput, setGroupInput] = useState('');
  const [subgroupInput, setSubgroupInput] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [toast, setToast] = useState("");

  // Persist to localStorage (existing)
useEffect(() => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}, [data]);

// Persist to backend
useEffect(() => {
  axios.post(`${API_BASE}/type-group-subgroup`, data).catch(err => console.warn('Failed to sync type/group data:', err));
}, [data]);
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  // --- CRUD ---
  const addType = () => {
    if (!typeInput.trim() || data[typeInput]) return;
    setData(prev => ({ ...prev, [typeInput]: {} }));
    setTypeInput(''); showToast('เพิ่ม Type สำเร็จ!');
  };
  const deleteType = (type) => {
    if (!window.confirm(`ลบ Type ${type}?`)) return;
    const newData = { ...data };
    delete newData[type];
    setData(newData);
    if (selectedType === type) setSelectedType('');
    showToast('ลบ Type สำเร็จ!');
  };
  const addGroup = () => {
    if (!selectedType || !groupInput.trim() || data[selectedType][groupInput]) return;
    setData(prev => ({ ...prev, [selectedType]: { ...prev[selectedType], [groupInput]: [] } }));
    setGroupInput(''); showToast('เพิ่ม Group สำเร็จ!');
  };
  const deleteGroup = (type, group) => {
    if (!window.confirm(`ลบ Group ${group} ใน ${type}?`)) return;
    const newData = { ...data };
    delete newData[type][group];
    setData(newData);
    if (selectedGroup === group) setSelectedGroup('');
    showToast('ลบ Group สำเร็จ!');
  };
  const addSubgroup = () => {
    if (!selectedType || !selectedGroup || !subgroupInput.trim()) return;
    setData(prev => ({ ...prev, [selectedType]: { ...prev[selectedType], [selectedGroup]: [...(prev[selectedType][selectedGroup] || []), subgroupInput] } }));
    setSubgroupInput(''); showToast('เพิ่ม Subgroup สำเร็จ!');
  };
  const deleteSubgroup = (type, group, subgroup) => {
    if (!window.confirm(`ลบ Subgroup ${subgroup} ใน ${group}?`)) return;
    setData(prev => ({ ...prev, [type]: { ...prev[type], [group]: prev[type][group].filter(sg => sg !== subgroup) } }));
    showToast('ลบ Subgroup สำเร็จ!');
  };

  // --- UI ---
  return (
    <div style={{ maxWidth: 1100, margin: '40px auto', padding: 36, background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f9ff 100%)', borderRadius: 32, boxShadow: '0 12px 48px #6366f122', minHeight: 600 }}>
      <Toast message={toast} onClose={() => setToast("")} />
      <h2 style={{ textAlign: 'center', color: '#6366f1', marginBottom: 40, fontWeight: 900, fontSize: '2.2rem', letterSpacing: '-1.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <span style={{fontSize:32}}>🛠️</span> Admin: <span style={{color:'#2563eb'}}>จัดการ Type / Group / Subgroup</span>
      </h2>
      <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Type Card */}
        <div style={{ ...glass, flex: 1, minWidth: 260, maxWidth: 340 }}>
          <div style={sectionTitle}><span style={icon}>📦</span>Type</div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
            <input value={typeInput} onChange={e => setTypeInput(e.target.value)} placeholder="เพิ่ม Type ใหม่ เช่น Service" style={input} />
            <button onClick={addType} style={addBtn}><span style={{fontSize:20}}>＋</span>เพิ่ม</button>
          </div>
          <div style={{ minHeight: 40 }}>
            {Object.keys(data).length === 0 && <div style={empty}>ยังไม่มี Type</div>}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {Object.keys(data).map(type => (
                <li key={type} style={{ ...listItem, ...(selectedType === type ? selected : {}) }}>
                  <span style={{ fontWeight: 700, color: '#2563eb', cursor: 'pointer', flex: 1 }} onClick={() => { setSelectedType(type); setSelectedGroup(''); }}>{type}</span>
                  <button onClick={() => deleteType(type)} style={delBtn}>ลบ</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Group Card */}
        <div style={{ ...glass, flex: 1, minWidth: 260, maxWidth: 340 }}>
          <div style={sectionTitle}><span style={icon}>🗂️</span>Group</div>
          {selectedType ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
                <input value={groupInput} onChange={e => setGroupInput(e.target.value)} placeholder="เพิ่ม Group เช่น Hardware" style={input} />
                <button onClick={addGroup} style={addBtn}><span style={{fontSize:20}}>＋</span>เพิ่ม</button>
              </div>
              <div style={{ minHeight: 40 }}>
                {Object.keys(data[selectedType] || {}).length === 0 && <div style={empty}>ยังไม่มี Group</div>}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {Object.keys(data[selectedType] || {}).map(group => (
                    <li key={group} style={{ ...listItem, ...(selectedGroup === group ? selected : {}) }}>
                      <span style={{ fontWeight: 700, color: '#0ea5e9', cursor: 'pointer', flex: 1 }} onClick={() => setSelectedGroup(group)}>{group}</span>
                      <button onClick={() => deleteGroup(selectedType, group)} style={delBtn}>ลบ</button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : <div style={{ color: '#b0b7c3', marginTop: 32, textAlign: 'center' }}>เลือก Type ก่อน</div>}
        </div>
        {/* Subgroup Card */}
        <div style={{ ...glass, flex: 1, minWidth: 260, maxWidth: 340 }}>
          <div style={sectionTitle}><span style={icon}>🔖</span>Subgroup</div>
          {selectedType && selectedGroup ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
                <input value={subgroupInput} onChange={e => setSubgroupInput(e.target.value)} placeholder="เพิ่ม Subgroup เช่น ติดตั้งอุปกรณ์" style={input} />
                <button onClick={addSubgroup} style={addBtn}><span style={{fontSize:20}}>＋</span>เพิ่ม</button>
              </div>
              <div style={{ minHeight: 40 }}>
                {(data[selectedType][selectedGroup] || []).length === 0 && <div style={empty}>ยังไม่มี Subgroup</div>}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {(data[selectedType][selectedGroup] || []).map(subgroup => (
                    <li key={subgroup} style={listItem}>
                      <span style={{ color: '#334155', fontWeight: 600, flex: 1 }}>{subgroup}</span>
                      <button onClick={() => deleteSubgroup(selectedType, selectedGroup, subgroup)} style={delBtn}>ลบ</button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : <div style={{ color: '#b0b7c3', marginTop: 32, textAlign: 'center' }}>เลือก Group ก่อน</div>}
        </div>
      </div>
    </div>
  );
} 
import { useState, useEffect } from "react";
import axios from "axios";
import { getTypeGroupSubgroup } from "./App";

// ----------------------- Component ---------------------

// ----------------------- Component ---------------------
export default function TicketEditForm({ initialTicket = {}, onSave, onCancel }) {
  // --- State -------------------------------------------------------------
  const [form, setForm] = useState({
    type: "",
    group: "",
    subgroup: "",
    // สามารถเพิ่มฟิลด์อื่น ๆ ที่ต้องการแก้ไขได้ที่นี่
  });
  const [groupOptions, setGroupOptions]       = useState([]);
  const [subgroupOptions, setSubgroupOptions] = useState([]);
  const [saving, setSaving]                   = useState(false);
  const [error, setError]                     = useState("");
  const [typeGroupMapping, setTypeGroupMapping] = useState(getTypeGroupSubgroup());

  // --- Listen for type/group data updates from AdminTypeGroupManager -----
  useEffect(() => {
    const handleTypeGroupUpdate = (event) => {
      const newMapping = getTypeGroupSubgroup(); // Re-read from localStorage
      setTypeGroupMapping(newMapping);
      
      // Update dropdowns if current selections are still valid
      const currentType = form.type;
      const currentGroup = form.group;
      
      if (currentType) {
        const newGroupOptions = Object.keys(newMapping[currentType] || {});
        setGroupOptions(newGroupOptions);
        
        // If current group is no longer valid, reset it
        if (currentGroup && !newGroupOptions.includes(currentGroup)) {
          setForm(prev => ({ ...prev, group: '', subgroup: '' }));
          setSubgroupOptions([]);
        } else if (currentGroup) {
          const newSubgroupOptions = (newMapping[currentType] || {})[currentGroup] || [];
          setSubgroupOptions(newSubgroupOptions);
          
          // If current subgroup is no longer valid, reset it
          if (form.subgroup && !newSubgroupOptions.includes(form.subgroup)) {
            setForm(prev => ({ ...prev, subgroup: '' }));
          }
        }
      }
    };
    
    window.addEventListener('typeGroupDataUpdated', handleTypeGroupUpdate);
    return () => window.removeEventListener('typeGroupDataUpdated', handleTypeGroupUpdate);
  }, [form.type, form.group, form.subgroup]);

  // --- Pre-fill when editing existing ticket -----------------------------
  useEffect(() => {
    if (!initialTicket) return;

    // Extract type with proper field mapping
    const rawType = initialTicket["Type"] || initialTicket["TYPE"] || initialTicket.type || "";
    const typeUpper = rawType.toUpperCase();
    const type = typeUpper === "SERVICE" ? "Service" : typeUpper === "HELPDESK" ? "Helpdesk" : rawType;
    
    // Extract group based on ticket type (same logic as App.js)
    let group = "";
    if (type.toUpperCase() === "HELPDESK") {
      // For Helpdesk tickets, group is in Report field
      group = initialTicket["Report"] || initialTicket["report"] || initialTicket.report || "";
    } else if (type.toUpperCase() === "SERVICE") {
      // For Service tickets, group is in requested field
      group = initialTicket["requested"] || initialTicket["Requested"] || initialTicket["Requeste"] || initialTicket["request"] || initialTicket.requested || "";
    } else {
      // Fallback to standard Group fields
      group = initialTicket["GROUP"] || initialTicket["Group"] || initialTicket["group"] || initialTicket.group || "";
    }
    
    // Extract subgroup
    const subgroup = initialTicket["Subgroup"] || initialTicket["SUBGROUP"] || initialTicket["subgroup"] || initialTicket.subgroup || initialTicket.sub_group || initialTicket.subGroup || "";

    setForm({ type, group, subgroup });
    
    if (type) {
      const groups = Object.keys(typeGroupMapping[type] || {});
      setGroupOptions(groups);
    }
    
    if (type && group) {
      const subgroups = (typeGroupMapping[type] || {})[group] || [];
      setSubgroupOptions(subgroups);
    }
  }, [initialTicket, typeGroupMapping]);

  // --- Helpers -----------------------------------------------------------
  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // 1) Type change
  const onTypeChange = e => {
    const newType = e.target.value;
    handleChange("type", newType);
    setGroupOptions(newType ? Object.keys(typeGroupMapping[newType] || {}) : []);
    setSubgroupOptions([]);
    handleChange("group", "");
    handleChange("subgroup", "");
  };

  // 2) Group change
  const onGroupChange = e => {
    const newGroup = e.target.value;
    handleChange("group", newGroup);
    setSubgroupOptions(form.type && newGroup ? (typeGroupMapping[form.type] || {})[newGroup] || [] : []);
    handleChange("subgroup", "");
  };

  // 3) Subgroup change
  const onSubgroupChange = e => handleChange("subgroup", e.target.value);

  // --- Submit ------------------------------------------------------------
  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      setSaving(true);
      const payload = { type: form.type, subgroup: form.subgroup, group: form.group };
      if (form.type === "Service") {
        payload.request = form.group;
      } else if (form.type === "Helpdesk") {
        payload.report = form.group;
      } else {
        payload.requested = form.group;
        payload.request = form.group; // legacy fallback
      }
      const API_BASE_URL = process.env.REACT_APP_API_BASE || '';
      await axios.post(`${API_BASE_URL}/update-ticket`, payload);
      setSaving(false);
      onSave?.();
    } catch (err) {
      setSaving(false);
      setError(err?.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้");
    }
  };
 
  // --- UI ----------------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
      {/* TYPE */}
      <label>Type {form.type && <span style={{ color: '#059669', fontWeight: 'bold' }}>: {form.type}</span>}</label>
      <select value={form.type} onChange={onTypeChange} required style={{ width: "100%", marginBottom: 8 }}>
        <option value="">{form.type ? `ปัจจุบัน: ${form.type} (คลิกเพื่อเปลี่ยน)` : '--เลือก Type--'}</option>
        {Object.keys(getTypeGroupSubgroup()).map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* GROUP */}
      <label>Group {form.group && <span style={{ color: '#059669', fontWeight: 'bold' }}>: {form.group}</span>}</label>
      <select
        value={form.group}
        onChange={onGroupChange}
        disabled={!groupOptions.length}
        required
        style={{ width: "100%", marginBottom: 8 }}
      >
        <option value="">{form.group ? `ปัจจุบัน: ${form.group} (คลิกเพื่อเปลี่ยน)` : '--เลือก Group--'}</option>
        {groupOptions.map(g => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      {/* SUBGROUP */}
      <label>Subgroup {form.subgroup && <span style={{ color: '#059669', fontWeight: 'bold' }}>: {form.subgroup}</span>}</label>
      <select
        value={form.subgroup}
        onChange={onSubgroupChange}
        disabled={!subgroupOptions.length}
        required
        style={{ width: "100%", marginBottom: 12 }}
      >
        <option value="">{form.subgroup ? `ปัจจุบัน: ${form.subgroup} (คลิกเพื่อเปลี่ยน)` : '--เลือก Subgroup--'}</option>
        {subgroupOptions.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {error && <div style={{ color: "#ef4444", marginBottom: 8 }}>{error}</div>}

      <button type="submit" disabled={saving} style={{ marginRight: 8 }}>
        {saving ? "Saving…" : "Save"}
      </button>
      <button type="button" onClick={onCancel} disabled={saving}>
        Cancel
      </button>
    </form>
  );
}
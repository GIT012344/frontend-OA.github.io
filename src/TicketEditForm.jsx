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
      console.log('[TicketEditForm] Type/Group data updated, refreshing...', event.detail);
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

        const rawType = initialTicket.type || "";
    const typeUpper = rawType.toUpperCase();
    const type = typeUpper === "Service" ? "Service" : typeUpper === "HELPDESK" ? "Helpdesk" : rawType;
    const group = type === "Service" ? initialTicket.request : type === "Helpdesk" ? initialTicket.report : initialTicket.group || "";
    const subgroup = initialTicket.subgroup || "";

    setForm({ type, group, subgroup });
    if (type) setGroupOptions(Object.keys(typeGroupMapping[type] || {}));
    if (type && group) setSubgroupOptions((typeGroupMapping[type] || {})[group] || []);
  }, [initialTicket, typeGroupMapping]);

  // --- Helpers -----------------------------------------------------------
  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // 1) Type change
  const onTypeChange = e => {
    const newType = e.target.value;
    handleChange("type", newType);
    console.log('[TicketEditForm] mapping for type', newType, typeGroupMapping[newType]);
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
      await axios.post("https://backend-oa-pqy2.onrender.com/update-ticket", payload);
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
      <label>Type</label>
      <select value={form.type} onChange={onTypeChange} required style={{ width: "100%", marginBottom: 8 }}>
        <option value="">--เลือก Type--</option>
        {Object.keys(getTypeGroupSubgroup()).map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* GROUP */}
      <label>Group</label>
      <select
        value={form.group}
        onChange={onGroupChange}
        disabled={!groupOptions.length}
        required
        style={{ width: "100%", marginBottom: 8 }}
      >
        <option value="">--เลือก Group--</option>
        {groupOptions.map(g => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      {/* SUBGROUP */}
      <label>Subgroup</label>
      <select
        value={form.subgroup}
        onChange={onSubgroupChange}
        disabled={!subgroupOptions.length}
        required
        style={{ width: "100%", marginBottom: 12 }}
      >
        <option value="">--เลือก Subgroup--</option>
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
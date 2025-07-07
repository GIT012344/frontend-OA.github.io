import { useState, useEffect } from "react";
import axios from "axios";

// ----------------------- Mapping -----------------------
export const TYPE_GROUP_SUBGROUP = {
  SERVICE: {
    Hardware: [
      "ลงทะเบียน USB", "ติดตั้งอุปกรณ์", "ทดสอบอุปกรณ์", "ตรวจสอบอุปกรณ์"
    ],
    Meeting: [
      "ติดตั้งอุปกรณ์ประชุม", "ขอ Link ประชุม / Zoom", "เชื่อมต่อ TV", "ขอยืมอุปกรณ์"
    ],
    Service: [
      "ขอยืมอุปกรณ์", "เชื่อมต่ออุปกรณ์", "ย้ายจุดติดตั้ง"
    ],
    Software: [
      "ติดตั้งโปรแกรม", "ตั้งค่าโปรแกรม", "ตรวจสอบโปรแกรม", "เปิดสิทธิ์การใช้งาน"
    ],
    "บริการอื่นๆ": []
  },
  HELPDESK: {
    "คอมพิวเตอร์": ["PC", "Notebook", "MAC"],
    "ปริ้นเตอร์": ["เครื่องพิมพ์", "Barcode Printer", "Scanner"],
    "อุปกรณ์ต่อพ่วง": ["เมาส์", "คีย์บอร์ด", "UPS", "จอคอมพิวเตอร์", "Projector"],
    "โปรแกรม": [
      "Windows", "User Login", "E-Mail / Outlook", "ERP/CRM/LMS", "MyHR", "ระบบผิดพลาด", "อื่นๆ"
    ],
    "เน็ตเวิร์ค": ["การเชื่อมต่อ", "ไม่มีสัญญาณ", "WIFI"],
    "ข้อมูล": ["ข้อมูลหาย", "File Sharing/Map Drive"],
    "ปัญหาอื่นๆ": []
  }
};

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

  // --- Pre-fill when editing existing ticket -----------------------------
  useEffect(() => {
    if (!initialTicket) return;

    const type = initialTicket.type || "";
    const group = type === "SERVICE" ? initialTicket.request : type === "HELPDESK" ? initialTicket.report : "";
    const subgroup = initialTicket.subgroup || "";

    setForm({ type, group, subgroup });
    if (type) setGroupOptions(Object.keys(TYPE_GROUP_SUBGROUP[type]));
    if (type && group) setSubgroupOptions(TYPE_GROUP_SUBGROUP[type][group] || []);
  }, [initialTicket]);

  // --- Helpers -----------------------------------------------------------
  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // 1) Type change
  const onTypeChange = e => {
    const newType = e.target.value;
    handleChange("type", newType);
    setGroupOptions(newType ? Object.keys(TYPE_GROUP_SUBGROUP[newType]) : []);
    setSubgroupOptions([]);
    handleChange("group", "");
    handleChange("subgroup", "");
  };

  // 2) Group change
  const onGroupChange = e => {
    const newGroup = e.target.value;
    handleChange("group", newGroup);
    setSubgroupOptions(form.type && newGroup ? TYPE_GROUP_SUBGROUP[form.type][newGroup] : []);
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
      const payload = {
        type: form.type,
        subgroup: form.subgroup,
        ...(form.type === "SERVICE"
          ? { request: form.group }
          : { report: form.group })
      };
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
        <option value="SERVICE">SERVICE</option>
        <option value="HELPDESK">HELPDESK</option>
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

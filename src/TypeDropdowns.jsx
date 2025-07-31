import React, { useState, useEffect } from "react";

// Re-use the same mapping constant that lives in App.js
// If you later move this mapping to its own module, just import from there.
import { getTypeGroupSubgroup } from "./App";

/**
 * Reusable cascading dropdown component.
 *
 * Props
 * - level: "type" | "group" | "subgroup"  ⟶ which select to render
 * - type, group, subgroup: current selected values
 * - onTypeChange, onGroupChange, onSubgroupChange: handlers
 * - availableGroups, availableSubgroups: arrays (already computed in parent)
 * - disabled: boolean (global disable flag, e.g. while saving)
 */
export default function TypeDropdowns({
  level,
  type,
  group,
  subgroup,
  onTypeChange,
  onGroupChange,
  onSubgroupChange,
  availableGroups = [],
  availableSubgroups = [],
  disabled = false,
}) {
  const [typeGroupMapping, setTypeGroupMapping] = useState(getTypeGroupSubgroup());

  // --- Listen for type/group data updates from AdminTypeGroupManager -----
  useEffect(() => {
    const handleTypeGroupUpdate = (event) => {
      console.log('[TypeDropdowns] Type/Group data updated, refreshing...', event.detail);
      const newMapping = getTypeGroupSubgroup(); // Re-read from localStorage
      setTypeGroupMapping(newMapping);
    };
    
    window.addEventListener('typeGroupDataUpdated', handleTypeGroupUpdate);
    return () => window.removeEventListener('typeGroupDataUpdated', handleTypeGroupUpdate);
  }, []);
  const commonStyle = {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "0.85rem",
    background: "#fff",
    cursor: disabled ? "not-allowed" : "pointer",
    width: "100%",
  };

  if (level === "type") {
    return (
      <select value={type} onChange={onTypeChange} disabled={disabled} style={commonStyle}>
        <option value="">-- Select Type --</option>
        {Object.keys(typeGroupMapping).map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    );
  }

  if (level === "group") {
    const isDisabled = disabled || !type;
    return (
      <select
        value={group}
        onChange={onGroupChange}
        disabled={isDisabled}
        style={{ ...commonStyle, background: isDisabled ? "#f1f5f9" : "#fff" }}
      >
        <option value="">-- Select Group --</option>
        {availableGroups.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
    );
  }

  // subgroup
  const isDisabled = disabled || !group;
  return (
    <select
      value={subgroup}
      onChange={onSubgroupChange}
      disabled={isDisabled}
      style={{ ...commonStyle, background: isDisabled ? "#f1f5f9" : "#fff" }}
    >
      <option value="">-- Select Subgroup --</option>
      {availableSubgroups.map((sg) => (
        <option key={sg} value={sg}>
          {sg}
        </option>
      ))}
    </select>
  );
}

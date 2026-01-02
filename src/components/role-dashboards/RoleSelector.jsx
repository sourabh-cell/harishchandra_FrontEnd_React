import React from "react";
import { useRole } from "../../role/RoleContext";

const RoleSelector = ({ compact }) => {
  const { role, setRole, Roles } = useRole();

  return (
    <select
      value={role}
      onChange={(e) => setRole(e.target.value)}
      className={compact ? "role-select-compact" : "role-select"}
      aria-label="Select role"
      style={{ marginLeft: 8 }}
    >
      {Roles.map((r) => (
        <option
          key={typeof r === "object" ? r.id : r}
          value={typeof r === "object" ? r.role : r}
        >
          {typeof r === "object" ? r.label : r}
        </option>
      ))}
    </select>
  );
};

export default RoleSelector;

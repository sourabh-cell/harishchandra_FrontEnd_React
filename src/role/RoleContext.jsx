import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectAuthRoles } from "../features/authSlice";

const Roles = [
  { id: "6", role: "ROLE_ACCOUNTANT", label: "Accountant" },
  { id: "2", role: "ROLE_ADMIN", label: "Admin" },
  { id: "3", role: "ROLE_DOCTOR", label: "Doctor" },
  { id: "4", role: "ROLE_HEADNURSE", label: "Head Nurse" },
  { id: "7", role: "ROLE_HR", label: "HR" },
  { id: "9", role: "ROLE_INSURANCE", label: "Insurance" },
  { id: "8", role: "ROLE_LABORATORIST", label: "Laboratorist" },
  { id: "5", role: "ROLE_PHARMACIST", label: "Pharmacist" },
  { id: "10", role: "ROLE_RECEPTIONIST", label: "Receptionist" },
  { id: "1", role: "ROLE_SUPER_ADMIN", label: "Super Admin" },
];

const RoleContext = createContext(null);

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState("ROLE_ADMIN");
  const authRoles = useSelector(selectAuthRoles);

  // Sync role from authenticated user's roles when available
  useEffect(() => {
    if (Array.isArray(authRoles) && authRoles.length > 0) {
      // Prefer first role from auth
      setRole((prev) => (authRoles.includes(prev) ? prev : authRoles[0]));
    }
  }, [authRoles]);
  return (
    <RoleContext.Provider value={{ role, setRole, Roles }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
};

export default RoleContext;

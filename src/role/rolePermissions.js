const roleMenus = {
  ROLE_SUPER_ADMIN: ["ALL"],
  ROLE_ADMIN: ["ALL"],
  ROLE_RECEPTIONIST: [
    "dashboard",
    "doctor",
    "patient",
    "schedule",
    "appointments",
    "billing",
  ],
  ROLE_DOCTOR: ["dashboard", "patient", "schedule", "prescriptions"],
  ROLE_HEADNURSE: ["dashboard", "patient", "bed"],
  ROLE_LABORATORIST: ["dashboard", "reports"],
  ROLE_ACCOUNTANT: ["dashboard", "billing", "reports"],
  ROLE_PHARMACIST: ["dashboard", "pharmacy", "prescriptions"],
  ROLE_HR: ["dashboard", "employee", "payroll"],
  ROLE_INSURANCE: ["dashboard", "insurance", "billing"],
};

export function isMenuAllowed(role, key) {
  const allowed = roleMenus[role];
  if (!allowed) return false;
  if (allowed.includes("ALL")) return true;
  return allowed.includes(key);
}

export default roleMenus;

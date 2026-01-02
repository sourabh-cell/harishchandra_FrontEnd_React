import React from "react";
import { useRole } from "../../role/RoleContext";
import AdminDashboardRole from "./AdminDashboardRole";
import ReceptionistDashboard from "./ReceptionistDashboard";
import DoctorDashboard from "./DoctorDashboard";
import NurseDashboard from "./NurseDashboard";
import LaboratoristDashboard from "./LaboratoristDashboard";
import AccountantDashboard from "./AccountantDashboard";
import PharmacistDashboard from "./PharmacistDashboard";
import HRDashboard from "./HRDashboard";
import InsuranceDashboard from "./InsuranceDashboard";

const DashboardWrapper = () => {
  const { role } = useRole();

  switch (role) {
    case "ROLE_SUPER_ADMIN":
    case "ROLE_ADMIN":
      return <AdminDashboardRole />;
    case "ROLE_RECEPTIONIST":
      return <ReceptionistDashboard />;
    case "ROLE_DOCTOR":
      return <DoctorDashboard />;
    case "ROLE_HEADNURSE":
    case "ROLE_NURSE":
      return <NurseDashboard />;
    case "ROLE_LABORATORIST":
      return <LaboratoristDashboard />;
    case "ROLE_ACCOUNTANT":
      return <AccountantDashboard />;
    case "ROLE_PHARMACIST":
      return <PharmacistDashboard />;
    case "ROLE_HR":
      return <HRDashboard />;
    case "ROLE_INSURANCE":
      return <InsuranceDashboard />;
    default:
      return (
        <div className="p-4">
          <h2>Dashboard</h2>
          <p>Unknown or unsupported role: {role}</p>
        </div>
      );
  }
};

export default DashboardWrapper;

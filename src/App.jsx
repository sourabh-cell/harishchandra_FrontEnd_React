import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Layout from "./layout/Layout";
import { RoleProvider } from "./role/RoleContext";
import GlobalSpinner from "./components/spinner/GlobalSpinner";
import DashboardWrapper from "./components/role-dashboards/DashboardWrapper";
import ManageEmployee from "./components/human-resorces/manage-employee/ManageEmployee";
import AmbulanceAdd from "./components/ambulance/ambulance-add/AmbulanceAdd";
import AmbulanceAssignment from "./components/ambulance/ambulance-assignment/AmbulanceAssignment";
import AmbulanceDashboard from "./components/ambulance/ambulance-dashboard/AmbulanceDashboard";
import AddDriver from "./components/ambulance/add-driver/AddDriver";
import BedList from "./components/bed-manager/bed-list/BedList";
import BedAssign from "./components/bed-manager/bed-assign/BedAssign";
import AllottedBeds from "./components/bed-manager/alloted-beds/AllottedBeds";
import AddBeds from "./components/bed-manager/add-beds/AddBeds";
import AddRoom from "./components/bed-manager/add-room/AddRoom";
import LoginPage from "./components/auth/login/LoginPage";
import ForgotPassword from "./components/auth/forgot-password/ForgotPassword";
import ViewNotices from "./components/notice/manage-notice/view-notice/ViewNotices";
import CreateNotice from "./components/notice/manage-notice/add-new-notice/CreateNotice";
import EmployeeRegistration from "./components/human-resorces/add-new-employee/EmployeeRegistration";
import ManageDepartment from "./components/department/ManageDepartment";
import UpdateDepartment from "./components/department/UpdateDepartment";
import AddDepartment from "./components/department/AddDepartment";
import AddAsset from "./components/asset-management/add-asset/AddAsset";
import AssetList from "./components/asset-management/asset-list/AssetList";
import AddHealthPackage from "./components/helth-package/add-helth-package/AddHealthPackage";
import HealthPackages from "./components/helth-package/manage-helth-package/HealthPackages";
import UpdateHelthPackage from "./components/helth-package/update-package/UpdateHelthPackage";
import UpdateAsset from "./components/asset-management/update-asset/UpdateAsset";
import AddNewDonor from "./components/blood-bank/add-new-donor/AddNewDonor";
import ManageDonor from "./components/blood-bank/manage-donor/ManageDonor";
import AddBloodStock from "./components/blood-bank/add-stock/AddBloodStock";
import BloodStock from "./components/blood-bank/blood-stock/BloodStock";
import AddDonor from "./components/blood-bank/add-new-donor/AddNewDonor.jsx";
import BabyBirthCertificate from "./components/reports/baby-birth-certificate/BabyBirthCertificate";
import DeathCertificateForm from "./components/reports/deth-certificate/DeathCertificateForm";
import ManageBirthCertificates from "./components/reports/manage-birth-certificates/ManageBirthCertificates";
import EditBirthCertificate from "./components/reports/edit-birth-certificate/EditBirthCertificate";
import AddDoctorSchedule from "./components/doctor-schedule/add-schedule/AddDoctorSchedule";
import ManageDethCertificates from "./components/reports/manage-deth-certificates/ManageDethCertificates";
import EditDeathCertificateForm from "./components/reports/edit-death-certificate/EditDeathCertificateForm";
import PharmacyModule from "./components/pharmacy/PharmacyModule";
import DoctorScheduleList from "./components/doctor-schedule/schedule-list/DoctorScheduleList";
import EditDoctorSchedule from "./components/doctor-schedule/edit-doctor-schedule/EditDoctorSchedule";
import AddPathalogyForm from "./components/reports/pathalogy/add-pathalogy-report/AddPathalogyForm";
import RadiologyForm from "./components/reports/radiology/add-radiology-report/RadiologyForm.jsx";
import AddPatientAppointment from "./components/appointments/add-appointments/AddPatientAppointment";
import ViewPatientAppointment from "./components/appointments/view-appointments/ViewPatientAppointment";
import AddNewPrescription from "./components/prescriptions/add-new-prescription/AddNewPriscription";
import ManagePrescription from "./components/prescriptions/manage-priscription/ManagePrescription";
import PathologyReportList from "./components/reports/pathalogy/manage-pathalogy-report/PathologyReportList";
import RadiologyReportList from "./components/reports/radiology/manage-radiology-report/RadiologyReportList";
import EditNotice from "./components/notice/manage-notice/edit-notice/EditNotice";
import Settings from "./components/setting/Settings";
import EditPatientAppointment from "./components/appointments/edit-appointments/EditPatientAppointment";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CreateInvoice from "./components/invoice/create-invoice/CreateInvoice";
import ViewInvoice from "./components/invoice/manage-invoices/ViewInvoice";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  hydrateAuth,
  selectAuthStatus,
  selectAuthRoles,
  selectAuthPermissions,
  selectAuthExpiry,
  // selectIsAuthenticated,
  // logout,
} from "./features/authSlice.js";
import ViewDoctor from "./components/doctor/view-doctor/ViewDoctor.jsx";
import useSessionTimeout from "./hooks/useSessionTimeout.js";
import EditPrescription from "./components/prescriptions/edit-prescription/EditPrescription.jsx";
import AddOpd from "./components/patients/opd/add-opd/AddOpd.jsx";
import ViewOpd from "./components/patients/opd/view-opd/ViewOpd.jsx";
import AddIpd from "./components/patients/ipd/add-ipd/AddIpd.jsx";
import AddEmergency from "./components/patients/emergency/add-emergency/AddEmergency.jsx";
import ViewIpd from "./components/patients/ipd/view-ipd/ViewIpd.jsx";
import ViewEmergency from "./components/patients/emergency/view-emergency/ViewEmergency.jsx";
import MyProfile from "./components/auth/my-profile/MyProfile.jsx";
import EditPathologyForm from "./components/reports/pathalogy/edit-pathology-report/EditPathologyForm.jsx";
import EditRadiologyForm from "./components/reports/radiology/edit-radiology-report/EditRadiologyForm.jsx";
import ManageInvoice from "./components/invoice/manage-invoices/ManageInvoice.jsx";
import PatientVisitTable from "./components/patient managment/patient table/PatientVisitTable.jsx";
import CreatePatientVisit from "./components/patient managment/Patient visit/CreatePatientVisit.jsx";
import PatientRegistration from "./components/patient managment/patient registration/add patient/PatientRegistration.jsx";
import PatientRegistrationList from "./components/patient managment/patient registration/manage patient/PatientRegistrationList.jsx";
import PatientDashboard from "./components/case manager/PatientCaseTable.jsx";
import PatientCaseView from "./components/case manager/PatientCaseView.jsx";
import AddPatientCase from "./components/case manager/AddPatientCase.jsx";
import PatientCaseTable from "./components/case manager/PatientCaseTable.jsx";

function SessionManager() {
  const exp = useSelector(selectAuthExpiry);
  useSessionTimeout(exp);
  return null; // no UI, just runs the hook
}

function App() {
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const roles = useSelector(selectAuthRoles);
  const permissions = useSelector(selectAuthPermissions);
  const [isHydrating, setIsHydrating] = React.useState(true);

  // const expiresAt = useSelector(selectAuthExpiry);
  // const isAuthenticated = useSelector(selectIsAuthenticated);
  // const expiryAlertShownRef = React.useRef(false);

  // useEffect(() => {
  //   if (!expiresAt || expiryAlertShownRef.current) return;

  //   // normalize stored expiry (seconds or ms) to ms
  //   const rawExp = expiresAt;
  //   const expMs = rawExp < 1e12 ? rawExp * 1000 : rawExp;
  //   if (expMs < Date.now()) {
  //     expiryAlertShownRef.current = true;
  //     dispatch(logout());

  //     Swal.fire({
  //       icon: "warning",
  //       title: "Session Expired",
  //       html: `
  //         <p>Your session has expired. You will be redirected in <b><span id="countdown">6</span></b> seconds.</p>
  //         <button id="loginBtn" class="swal2-confirm swal2-styled" style="background-color:#01c0c8;margin-top:10px;">
  //           Login Again
  //         </button>
  //       `,
  //       showConfirmButton: false,
  //       allowOutsideClick: false,
  //       didOpen: () => {
  //         let seconds = 6;
  //         const countdownEl = document.getElementById("countdown");
  //         const interval = setInterval(() => {
  //           seconds--;
  //           if (countdownEl) countdownEl.textContent = seconds;
  //           if (seconds <= 0) {
  //             clearInterval(interval);
  //             window.location.href = "/";
  //           }
  //         }, 1000);

  //         const loginBtn = document.getElementById("loginBtn");
  //         if (loginBtn) {
  //           loginBtn.addEventListener("click", () => {
  //             clearInterval(interval);
  //             window.location.href = "/";
  //           });
  //         }
  //       },
  //     });
  //   }
  // }, [expiresAt, isAuthenticated, dispatch]);

  useEffect(() => {
    // console.log("Dispatching hydrateAuth...");
    dispatch(hydrateAuth()).finally(() => {
      // Auth hydration complete (success or failure)
      setIsHydrating(false);
    });
  }, [dispatch]);

  // Show loading spinner while hydrating auth
  if (isHydrating) {
    return <GlobalSpinner />;
  }

  // console.log("Auth status:", status);
  // console.log("Auth roles:", roles, "permissions:", permissions);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <LoginPage />,
    },
    {
      path: "forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "registration",
      element: (
        <ProtectedRoute>
          <EmployeeRegistration />
        </ProtectedRoute>
      ),
    },
    {
      path: "dashboard",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <DashboardWrapper />,
        },
        // Doctor Management Routes

        {
          path: "view-doctors",
          element: <ViewDoctor />,
        },
        {
          path: "view-doctor-shedule",
          element: <DoctorScheduleList />,
        },

        // Human Resorces Routes
        {
          path: "add-new-employee",
          element: <EmployeeRegistration />,
        },

        {
          path: "manage-employees",
          element: <ManageEmployee />,
        },

        // Ambulance Routes
        {
          path: "ambulance-add",
          element: <AmbulanceAdd />,
        },
        {
          path: "ambulance-assignment",
          element: <AmbulanceAssignment />,
        },
        {
          path: "ambulance-dashboard",
          element: <AmbulanceDashboard />,
        },
        {
          path: "add-driver",
          element: <AddDriver />,
        },

       // Case Manager Routes
       {
        path: "add-case-study",
        element: <AddPatientCase/>,
      },
      {
        path: "table-case-study",
        element: <PatientCaseTable/>,
      },
      {
        path: "view-patient-case/:id",
        element: <PatientCaseView />,
      },






        // Bed Manager Routes
        {
          path: "bed-list",
          element: <BedList />,
        },
        {
          path: "bed-assign/:id",
          element: <BedAssign />,
        },
        {
          path: "allotted-beds",
          element: <AllottedBeds />,
        },
        {
          path: "add-beds",
          element: <AddBeds />,
        },
        {
          path: "add-room",
          element: <AddRoom />,
        },

        // Notice Management Routes
        {
          path: "manage-notices",
          element: <ViewNotices />,
        },
        {
          path: "add-new-notice",
          element: <CreateNotice />,
        },
        {
          path: "edit-notice/:id",
          element: <EditNotice />,
        },

        //Department Routes
        {
          path: "manage-department",
          element: <ManageDepartment />,
        },
        {
          path: "update-department/:id",
          element: <UpdateDepartment />,
        },
        {
          path: "add-department",
          element: <AddDepartment />,
        },

        // Asset Management Routes
        {
          path: "add-asset",
          element: <AddAsset />,
        },
        {
          path: "asset-list",
          element: <AssetList />,
        },
        {
          path: "update-asset/:id",
          element: <UpdateAsset />,
        },

        //Helth Package Routes
        {
          path: "add-health-package",
          element: <AddHealthPackage />,
        },
        {
          path: "manage-health-packages",
          element: <HealthPackages />,
        },
        {
          path: "update-health-package/:id",
          element: <UpdateHelthPackage />,
        },

        // Donor Management Routes
        {
          path: "add-new-donor",
          element: <AddNewDonor />,
        },
        {
          path: "manage-donors",
          element: <ManageDonor />,
        },
        {
          path: "add-stock",
          element: <AddBloodStock />,
        },
        {
          path: "manage-blood-stock",
          element: <BloodStock />,
        },

        //reports routes here
        {
          path: "baby-birth-certificate",
          element: <BabyBirthCertificate />,
        },
        {
          path: "death-certificate",
          element: <DeathCertificateForm />,
        },
        {
          path: "manage-birth-certificates",
          element: <ManageBirthCertificates />,
        },
        {
          path: "edit-birth-certificate/:id",
          element: <EditBirthCertificate />,
        },
        {
          path: "manage-death-certificates",
          element: <ManageDethCertificates />,
        },
        {
          path: "edit-death-certificate/:id",
          element: <EditDeathCertificateForm />,
        },
        {
          path: "add-radiology-report",
          element: <RadiologyForm />,
        },
        {
          path: "add-pathology-report",
          element: <AddPathalogyForm />,
        },
        {
          path: "edit-pathology-report/:id",
          element: <EditPathologyForm />,
        },
        {
          path: "edit-radiology-report/:id",
          element: <EditRadiologyForm />,
        },
        {
          path: "manage-pathology-reports",
          element: <PathologyReportList />,
        },
        {
          path: "manage-radiology-reports",
          element: <RadiologyReportList />,
        },

        // Add Doctors Schedule
        {
          path: "add-doctor-schedule",
          element: <AddDoctorSchedule />,
        },

        {
          path: "view-doctor-schedule-list",
          element: <DoctorScheduleList />,
        },
        {
          path: "edit-doctor-schedule/:id",
          element: <EditDoctorSchedule />,
        },

        // Pharmacy Management Routes
        {
          path: "pharmacy-module",
          element: <PharmacyModule />,
        },

        // Appointments Management Routes
        {
          path: "add-patient-appointment",
          element: <AddPatientAppointment />,
        },
        {
          path: "view-patient-appointments",
          element: <ViewPatientAppointment />,
        },
        {
          path: "edit-patient-appointment/:id",
          element: <EditPatientAppointment />,
        },

        // Prescription Management Routes
        {
          path: "add-new-prescription",
          element: <AddNewPrescription />,
        },
        {
          path: "manage-prescriptions",
          element: <ManagePrescription />,
        },
        {
          path: "edit-prescription/:id",
          element: <EditPrescription />,
        },

      //  Patient management routes here
        {
          path: "patients-registration/add-patient",
          element: <PatientRegistration />,
        },

        {
          path: "patients-registration-list/view-patients-list",
          element: <PatientRegistrationList />,
        },

        {
          path: "patients/create-patient",
          element: <CreatePatientVisit />,
        },

        {
          path: "patients/table/manage-visits",
          element: <PatientVisitTable />,
        },
        //settings route
        {
          path: "settings",
          element: <Settings />,
        },

        // Invoice Management Route
        {
          path: "invoice/create-invoice",
          element: <CreateInvoice />,
        },

        {
          path: "invoice/manage-invoices",
          element: <ManageInvoice />,
        },

        {
          path: "invoice/view-invoice/:id",
          element: <ViewInvoice />,
        },

        //my profile route can be added here
        {
          path: "my-profile",
          element: <MyProfile />,
        },
      ],
    },
  ]);
  return (
    <RoleProvider>
      <GlobalSpinner />
      <RouterProvider router={router}>
        <SessionManager />
      </RouterProvider>
    </RoleProvider>
  );
}

export default App;

// Sidebar configuration for the hospital management system
export const sidebarMenu = [
  {
    title: "Dashboard",
    icon: "fa fa-tachometer-alt",
    dynamicDashboard: true,
    roles: [
      "SUPER_ADMIN",
      "ADMIN",
      "HR",
      "DOCTOR",
      "RECEPTIONIST",
      "ACCOUNTANT",
      "HEADNURSE",
      "INSURANCE",
      "LABORATORIST",
      "PHARMACIST",
    ],
    permissions: ["DASHBOARD_ACCESS"],
  },

  // Department Management Menu

  {
    title: "Departments",
    icon: "fa fa-building",
    collapseId: "department-menu",
    roles: [
      "SUPER_ADMIN",
      "ADMIN",
      "HR",
      "DOCTOR",
      "RECEPTIONIST",
      "ACCOUNTANT",
      "HEADNURSE",
      "INSURANCE",
      "LABORATORIST",
      "PHARMACIST",
    ],
    children: [
      {
        title: "Add Department",
        path: "/dashboard/add-department",
        permissions: ["DEPARTMENT_ADD"],
      },
      {
        title: "Manage Departments",
        path: "/dashboard/manage-department",
        permissions: [
          "DEPARTMENT_VIEW",
          "DEPARTMENT_UPDATE",
          "DEPARTMENT_DELETE",
        ],
      },
    ],
  },

  // Doctor Management Menu
  {
    title: "Doctor",
    icon: "fa fa-user-md",
    collapseId: "doctor-menu",
    roles: [
      "SUPER_ADMIN",
      "ADMIN",
      "DOCTOR",
      "RECEPTIONIST",
      "HR",
      "ACCOUNTANT",
      "HEADNURSE",
      "INSURANCE",
      "LABORATORIST",
      "PHARMACIST",
    ],
    children: [
      {
        title: "View Doctor",
        path: "/dashboard/view-doctors",
        permissions: [
          "DOCTOR_LIST",
          "DOCTOR_LIST_PROFILE_VIEW",
          "DOCTOR_LIST_UPDATE",
        ],
      },
      {
        title: "Add Schedule",
        path: "/dashboard/add-doctor-schedule",
        permissions: ["SCHEDULE_ADD"],
      },
      {
        title: "View Schedule",
        path: "/dashboard/view-doctor-shedule",
        permissions: ["SCHEDULE_LIST", "SCHEDULE_UPDATE", "SCHEDULE_DELETE"],
      },
    ],
  },

  // Appointment Management Menu
  {
    title: "Appointments",
    icon: "fa fa-calendar-check",
    collapseId: "appointment-menu",
    roles: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST", "DOCTOR", "HEADNURSE"],
    children: [
      {
        title: "Add Appointment",
        path: "/dashboard/add-patient-appointment",
        permissions: ["APPOINTMENT_ADD"],
      },

      {
        title: "Manage Appointments",
        path: "/dashboard/view-patient-appointments",
        permissions: [
          "APPOINTMENT_LIST",
          "APPOINTMENT_DELETE",
          "APPOINTMENT_UPDATE",
        ],
      },
    ],
  },

  // Patient Management Menu

  {
    title: "Patient Management",
    icon: "fa fa-procedures",
    collapseId: "patient-management",
    roles: [
      "SUPER_ADMIN",
      "ADMIN",
      "DOCTOR",
      "RECEPTIONIST",
      "HR",
      "ACCOUNTANT",
      "HEADNURSE",
      "INSURANCE",
      "LABORATORIST",
      "PHARMACIST",
    ],
    children: [
      {
        title: "Patient Registration",
        collapseId: "patient-registration-section",
        children: [
          {
            title: "Add Patient",
            path: "patients-registration/add-patient",
            permissions: ["PATIENT_ADD"],
          },
          {
            title: "Manage Patients",
            path: "patients-registration-list/view-patients-list",
            permissions: ["PATIENT_LIST", "PATIENT_UPDATE", "PATIENT_DELETE"],
          },
        ],
      },
      {
        title: "Patient Visits",
        collapseId: "patient-visits-section",
        children: [
          {
            title: "Create New Visit",
            path: "patients/create-patient",
            permissions: ["PATIENT_ADD"],
          },
          {
            title: "Manage Visits",
            path: "/dashboard/patients/table/manage-visits",
            permissions: ["PATIENT_LIST", "PATIENT_UPDATE", "PATIENT_DELETE"],
          },
        ],
      },
      
    ],
  },

  // ADT Management Menu
  {
    title: "ADT Manager",
    icon: "fa fa-procedures",
    collapseId: "adt-menu",
    roles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST", "HEADNURSE"],
    children: [
      {
        title: "Add ADT Record",
        path: "/dashboard/add-adt-record",
        permissions: ["ADT_ADD"],
      },
      {
        title: "Manage ADT Records",
        path: "/dashboard/view-adt-records",
        permissions: ["ADT_LIST", "ADT_UPDATE"],
      },
    ],
  },

  //case Manager Menu

  {
    title: "Case Manager",
    icon: "fa fa-briefcase-medical",
    collapseId: "case-menu",
    roles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST", "HEADNURSE"],
    children: [
      {
        title: "Add Case Study",
        path: "/dashboard/add-case-study",
        permissions: ["CASE_STUDY_ADD"],
      },
      {
        title: "View Case Studies",
        path: "/dashboard/table-case-study",
        permissions: ["CASE_STUDY_LIST"],
      },
    ],
  },

  // Bed Manager Menu
  {
    title: "Bed Manager",
    icon: "fa fa-bed",
    collapseId: "bed-menu",
    roles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST", "HEADNURSE"],
    children: [
      {
        title: "Add New Bed",
        path: "/dashboard/add-beds",
        permissions: ["BED_ADD"],
      },
      {
        title: "Add new Room",
        path: "/dashboard/add-room",
        permissions: ["ROOM_ADD"],
      },
      {
        title: "Manage Beds",
        path: "/dashboard/bed-list",
        permissions: ["BED_LIST", "BED_VACANT", "BED_ASSIGN", "BED_RELEASE"],
      },
    ],
  },

  // Invoice and Finance Management Menu
  {
    title: "Finance",
    icon: "fa fa-wallet",
    collapseId: "finance-menu",
    roles: [
      "SUPER_ADMIN",
      "ADMIN",
      "HR",
      "ACCOUNTANT",
      "RECEPTIONIST",
      "INSURANCE",
    ],
    children: [
      {
        title: "Invoice",
        collapseId: "invoice-section",
        children: [
          {
            title: "Add Invoice",
           path: "/dashboard/invoice/create-invoice",
            permissions: ["INVOICE_ADD"],
          },
          {
            title: "Manage Invoices",
            path: "/dashboard/invoice/manage-invoices",
            permissions: ["INVOICE_LIST", "INVOICE_UPDATE"],
          },
        ],
      },

     
    ],
  },

  // Human Resources Menu
  {
    title: "Human Resources",
    icon: "fa fa-users",
    collapseId: "hr-menu",
    roles: ["SUPER_ADMIN", "ADMIN", "HR"],
    children: [
      {
        title: "Add Employee",
        path: "/dashboard/add-new-employee",
        permissions: ["EMPLOYEE_ADD"],
      },
      {
        title: "Manage Employees",
        path: "/dashboard/manage-employees",
        permissions: ["EMPLOYEE_LIST"],
      },
    ],
  },

  // Reports Menu
  {
    title: "Reports",
    icon: "fa fa-tasks",
    collapseId: "reports-menu",
    roles: [
      "SUPER_ADMIN",
      "ADMIN",
      "DOCTOR",
      "RECEPTIONIST",
      "HEADNURSE",
      "LABORATORIST",
    ],
    children: [
      {
        title: "Birth Reports",
        collapseId: "birth-reports-section",
        children: [
          {
            title: "Add Birth Report",
            path: "/dashboard/baby-birth-certificate",
            roles: [
              "SUPER_ADMIN",
              "ADMIN",
              "DOCTOR",
              "RECEPTIONIST",
              "HEADNURSE",
            ],
            permissions: ["BIRTH_REPORT_ADD"],
          },
          {
            title: "Manage Birth Reports",
            path: "/dashboard/manage-birth-certificates",
            roles: [
              "SUPER_ADMIN",
              "ADMIN",
              "DOCTOR",
              "RECEPTIONIST",
              "HEADNURSE",
            ],
            permissions: ["REPORT_LIST"],
          },
        ],
      },
      {
        title: "Death Reports",
        collapseId: "death-reports-section",
        children: [
          {
            title: "Add Death Report",
            path: "/dashboard/death-certificate",
            roles: [
              "SUPER_ADMIN",
              "ADMIN",
              "DOCTOR",
              "RECEPTIONIST",
              "HEADNURSE",
            ],
            permissions: ["DEATH_REPORT_ADD"],
          },
          {
            title: "Manage Death Reports",
            path: "/dashboard/manage-death-certificates",
            roles: [
              "SUPER_ADMIN",
              "ADMIN",
              "DOCTOR",
              "RECEPTIONIST",
              "HEADNURSE",
            ],
            permissions: ["REPORT_LIST"],
          },
        ],
      },
      {
        title: "Pathology Reports",
        collapseId: "pathology-reports",
        roles: ["SUPER_ADMIN", "ADMIN", "LABORATORIST"], // ⬅️ फक्त या roles ला दाखवायचे
        children: [
          {
            title: "Add New Report",
            path: "/dashboard/add-pathology-report",
            permissions: ["PATHLAB_REPORT_ADD"],
            roles: ["SUPER_ADMIN", "ADMIN", "LABORATORIST"], // ⬅️ optional पण recommend
          },
          {
            title: "Manage Reports",
            path: "/dashboard/manage-pathology-reports",
            permissions: ["LAB_REPORT_LIST", "PATHLAB_REPORT_MANAGE"],
            roles: ["SUPER_ADMIN", "ADMIN", "LABORATORIST"], // ⬅️ optional पण recommend
          },
        ],
      },
      {
        title: "Radiology Reports",
        collapseId: "radiology-reports",
        roles: ["SUPER_ADMIN", "ADMIN", "LABORATORIST"], // ⬅️ फक्त या roles ला दाखवायचे
        children: [
          {
            title: "Add New Report",
            path: "/dashboard/add-radiology-report",
            permissions: ["RADIOLOGY_REPORT_ADD"],
            roles: ["SUPER_ADMIN", "ADMIN", "LABORATORIST"], // ⬅️ optional पण recommend
          },
          {
            title: "Manage Reports",
            path: "/dashboard/manage-radiology-reports",
            permissions: ["RADIOLOGY_REPORT_MANAGE", "LAB_REPORT_LIST"],
            roles: ["SUPER_ADMIN", "ADMIN", "LABORATORIST"], // ⬅️ optional पण recommend
          },
        ],
      },
    ],
  },

  // Prescriptions Menu
  {
    title: "Prescriptions",
    icon: "fa fa-prescription-bottle-alt",
    collapseId: "prescriptions-menu",
    roles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST", "HEADNURSE"],
    children: [
      {
        title: "Add Prescription",
        path: "/dashboard/add-new-prescription",
        permissions: ["PRESCRIPTION_ADD"],
      },
      {
        title: "Manage Prescriptions",
        path: "/dashboard/manage-prescriptions",
        permissions: ["PRESCRIPTION_LIST", "PRESCRIPTION_UPDATE"],
      },
    ],
  },

  // Insurance Management Menu
  {
    title: "Insurance",
    icon: "fa fa-shield-alt",
    collapseId: "insurance-menu",
    roles: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST", "INSURANCE"],
    children: [
      {
        title: "Add Claim",
        path: "/dashboard/add-insurance-claim",
        permissions: ["CLAIM_SUBMIT"],
      },
      {
        title: "Manage Claims",
        path: "/dashboard/manage-insurance-claims",
        permissions: ["CLAIM_STATUS_TRACK", "INSURANCE_REPORTS"],
      },
    ],
  },

  // Ambulance Management Menu

  {
    title: "Ambulance Manager",
    icon: "fa fa-ambulance",
    collapseId: "ambulance-menu",
    roles: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"],
    children: [
      {
        title: "Add Ambulance",
        path: "/dashboard/ambulance-add",
        permissions: ["AMBULANCE_ADD"],
      },
      {
        title: "Ambulances Dashboard",
        path: "/dashboard/ambulance-dashboard",
        permissions: ["AMBULANCE_AVAILABILITY", "AMBULANCE_VIEW"],
      },
      {
        title: "Ambulance Assignment",
        path: "/dashboard/ambulance-assignment",
        permissions: ["AMBULANCE_ASSIGNMENT"],
      },
      {
        title: "Add Driver",
        path: "/dashboard/add-driver",
        permissions: ["DRIVER_ADD"],
      },
    ],
  },
  // Blood Bank Management Menu

  {
    title: "Blood Bank",
    icon: "fa fa-tint",
    collapseId: "blood-bank-menu",
    roles: ["SUPER_ADMIN", "ADMIN", "RECEPTIONIST", "HEADNURSE"],
    children: [
      {
        title: "Add Donor",
        path: "/dashboard/add-new-donor",
        permissions: ["DONOR_ADD"],
      },
      {
        title: "Manage Donors",
        path: "/dashboard/manage-donors",
        permissions: ["DONOR_LIST"],
      },
      {
        title: "Add New Donation",
        path: "add-new-donation",
        permissions: ["BLOOD_STOCK_ADD"],
      },
      
      {
       title: "Manage Donations",
       path: "/dashboard/manage-donations",
        permissions: ["BLOOD_STOCK_LIST", "BLOOD_STOCK_UPDATE"], 
      },

      {
        title: "Manage Blood Stock",
        path: "/dashboard/manage-blood-stock",
        permissions: ["BLOOD_STOCK_VIEW", "BLOOD_STOCK_UPDATE"],
      },
    ],
  },

  // Asset Management Menu
  {
    title: "Asset management",
    icon: "fa fa-desktop",
    collapseId: "asset-menu",
    roles: ["SUPER_ADMIN", "ADMIN", "HR"],
    children: [
      {
        title: "Add Asset",
        path: "/dashboard/add-asset",
        permissions: ["ASSET_ADD"],
      },
      {
        title: "Manage Assets",
        path: "/dashboard/Asset-list",
        permissions: ["ASSET_VIEW", "ASSET_UPDATE"],
      },
    ],
  },
  //Health Package Management Menu
  {
    title: "Health Packages",
    icon: "fa fa-briefcase",
    collapseId: "health-packages-menu",
    roles: ["SUPER_ADMIN", "ADMIN", "HR", "DOCTOR", "RECEPTIONIST"],
    children: [
      {
        title: "Add Health Package",
        path: "/dashboard/add-health-package",
        permissions: ["HEALTH_PACKAGE_ADD"],
      },
      {
        title: "Manage Health Packages",
        path: "/dashboard/manage-health-packages",
        permissions: ["HEALTH_PACKAGE_LIST", "HEALTH_PACKAGE_MANAGE"],
      },
    ],
  },

  // Pharmacy Management Menu (was a single link — make it collapsible with children)
  {
    title: "Pharmacy",
    icon: "fa fa-pills",
    collapseId: "pharmacy-menu",
    roles: ["SUPER_ADMIN", "ADMIN", "PHARMACIST"],
    children: [
      {
        title: "Pharmacy Module",
        path: "/dashboard/pharmacy-module",
        permissions: [
          "MEDICINE_ADD",
          "MEDICINE_UPDATE",
          "MEDICINE_STOCK_VIEW",
          "PRESCRIPTION_DISPENSE",
          "PHARMACY_BILL_GENERATE",
        ],
      },
    ],
  },


  //Notices Menu
  {
    title: "Notices",
    icon: "fa fa-bell",
    collapseId: "notices-menu",
    roles: ["SUPER_ADMIN", "ADMIN", "HR"],
    children: [
      {
        title: "Add Notice",  
        path: "add-new-notice",
        permissions: ["NOTICE_ADD"],
      },
   {
        title: "Manage Notices",
        path: "/dashboard/manage-notices",
        permissions: ["NOTICE_LIST", "NOTICE_UPDATE", "NOTICE_DELETE"],
   }
    ],
  },

  // Settings Menu
  {
    title: "Settings",
    icon: "fa fa-cog",
    collapseId: "settings-menu",
    roles: ["SUPER_ADMIN", "ADMIN", "HR"],
    children: [
      {
        title: "System Settings",
        path: "/dashboard/settings",
        permissions: ["SYSTEM_SETTINGS_MANAGE"],
      },
    ],
  },
];

export default sidebarMenu;

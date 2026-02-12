export const GenderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "TRANSGENDER", label: "Transgender" },
  { value: "OTHER", label: "Other" },
];

// API URL from environment variable
export const API_URL = import.meta.env.VITE_API_BASE_URL || "";

export const MaritalStatusOptions = [
  { value: "SINGLE", label: "Single" },
  { value: "MARRIED", label: "Married" },
  { value: "DIVORCED", label: "Divorced" },
  { value: "WIDOW", label: "Widow" },
];

export const VisitTypeOptions = [
  { value: "OPD", label: "Outpatient" },
  { value: "IPD", label: "Inpatient" },
  { value: "EMERGENCY", label: "Emergency" },
];

export const VisitSequenceTypeOptions = [
  { value: "FIRST_VISIT", label: "First Visit" },
  { value: "FOLLOW_UP", label: "Follow Up" },
  { value: "REFERRED", label: "Referred" },
];

export const VisitStatusOptions = [
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REFERRED", label: "Referred" },
];

export const BloodGroupOptions = [
  { value: "A_POSITIVE", label: "A+" },
  { value: "A_NEGATIVE", label: "A-" },
  { value: "B_POSITIVE", label: "B+" },
  { value: "B_NEGATIVE", label: "B-" },
  { value: "AB_POSITIVE", label: "AB+" },
  { value: "AB_NEGATIVE", label: "AB-" },
  { value: "O_POSITIVE", label: "O+" },
  { value: "O_NEGATIVE", label: "O-" },
];

export const IdProofTypeOptions = [
  { value: "AADHAAR_CARD", label: "Aadhaar Card" },
  { value: "PAN_CARD", label: "PAN Card" },
  { value: "PASSPORT", label: "Passport" },
  { value: "VOTER_ID", label: "Voter ID" },
  { value: "DRIVING_LICENSE", label: "Driving License" },
];

export const AvailabilityStatusOptions = [
  { value: "ON_LEAVE", label: "On Leave" },
  { value: "RESIGNED", label: "Resigned" },
  { value: "ACTIVE", label: "Active" },
];

export const RoleNameOptions = [
  { value: 3, label: "Doctor" },
  { value: 6, label: "Accountant" },
  { value: 10, label: "Receptionist" },
  { value: 4, label: "Head Nurse" },
  { value: 5, label: "Pharmacist" },
  { value: 7, label: "HR" },
  { value: 8, label: "Laboratorist" },
  { value: 9, label: "Insurance" },
];
// export const RoleNameOptions = [
//  { value: 'ADMIN', label: 'Admin' },
//  { value: 'DOCTOR', label: 'Doctor' },
//  { value: 'ACCOUNTANT', label: 'Accountant' },
//  { value: 'RECEPTIONIST', label: 'Receptionist' },
//  { value: 'HEAD_NURSE', label: 'Head Nurse' },
//  { value: 'PHARMACIST', label: 'Pharmacist' },
//  { value: 'HR', label: 'HR' },
//  { value: 'LABORATORIST', label: 'Laboratorist' },
//  { value: 'INSURANCE', label: 'Insurance' }
// ];

export const LaboratoryType = [
  { value: "RADIOLOGY", label: "Radiology" },
  { value: "PATHOLOGY", label: "Pathology" },
];

export const ExperienceLevel = [
  { value: "ZERO_TO_ONE", label: "0-1 Years" },
  { value: "ONE_TO_TWO", label: "1-2 Years" },
  { value: "TWO_TO_THREE", label: "2-3 Years" },
  { value: "THREE_TO_FOUR", label: "3-4 Years" },
  { value: "FOUR_TO_FIVE", label: "4-5 Years" },
  { value: "FIVE_TO_SIX", label: "5-6 Years" },
  { value: "SIX_TO_SEVEN", label: "6-7 Years" },
  { value: "SEVEN_TO_EIGHT", label: "7-8 Years" },
  { value: "EIGHT_TO_NINE", label: "8-9 Years" },
  { value: "NINE_TO_TEN", label: "9-10 Years" },
  { value: "TEN_TO_ELEVEN", label: "10-11 Years" },
  { value: "ELEVEN_TO_TWELVE", label: "11-12 Years" },
  { value: "TWELVE_TO_THIRTEEN", label: "12-13 Years" },
  { value: "THIRTEEN_TO_FOURTEEN", label: "13-14 Years" },
  { value: "FOURTEEN_TO_FIFTEEN", label: "14-15 Years" },
  { value: "FIFTEEN_TO_SIXTEEN", label: "15-16 Years" },
  { value: "SIXTEEN_TO_SEVENTEEN", label: "16-17 Years" },
  { value: "SEVENTEEN_TO_EIGHTEEN", label: "17-18 Years" },
  { value: "EIGHTEEN_TO_NINETEEN", label: "18-19 Years" },
  { value: "NINETEEN_TO_TWENTY", label: "19-20 Years" },
  { value: "TWENTY_TO_TWENTY_ONE", label: "20-21 Years" },
  { value: "TWENTY_ONE_TO_TWENTY_TWO", label: "21-22 Years" },
  { value: "TWENTY_TWO_TO_TWENTY_THREE", label: "22-23 Years" },
  { value: "TWENTY_THREE_TO_TWENTY_FOUR", label: "23-24 Years" },
  { value: "TWENTY_FOUR_TO_TWENTY_FIVE", label: "24-25 Years" },
  { value: "TWENTY_FIVE_PLUS", label: "25+ Years" },
];

export const BedStatus = [
  { value: "VACANT", label: "Vacant" },
  { value: "OCCUPIED", label: "Occupied" },
];

export const RoomStatus = [
  { value: "AVAILABLE", label: "Available" },
  { value: "UNAVAILABLE", label: "Unavailable" },
  { value: "UNDER_MAINTENANCE", label: "Under Maintenance" },
];

export const AmbulanceType = [
  { value: "BASIC", label: "Basic" },
  { value: "ICU", label: "ICU" },
];

export const AmbulanceStatus = [
  { value: "AVAILABLE", label: "Available" },
  { value: "ON_DUTY", label: "On Duty" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

export const AssignmentStatus = [
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

export const QualificationOptions = {
  3: [
    // Doctor
    { value: "", label: "Select Qualification" },
    { value: "MBBS", label: "MBBS" },
    { value: "MD", label: "MD" },
    { value: "MS", label: "MS" },
    { value: "DM", label: "DM" },
    { value: "MCh", label: "MCh" },
    { value: "BDS", label: "BDS" },
    { value: "MDS", label: "MDS" },
    { value: "BHMS", label: "BHMS" },
    { value: "BAMS", label: "BAMS" },
    { value: "BPT", label: "BPT" },
    { value: "MPT", label: "MPT" },
  ],
  7: [
    // HR
    { value: "", label: "Select Qualification" },
    { value: "10th", label: "10th Pass" },
    { value: "12th", label: "12th Pass" },
    { value: "Graduation", label: "Graduation" },
    { value: "Post Graduation", label: "Post Graduation" },
    { value: "MBA", label: "MBA" },
    { value: "BBA", label: "BBA" },
  ],
  10: [
    // Receptionist
    { value: "", label: "Select Qualification" },
    { value: "10th", label: "10th Pass" },
    { value: "12th", label: "12th Pass" },
    { value: "Graduation", label: "Graduation" },
    { value: "Diploma", label: "Diploma" },
  ],
  5: [
    // Pharmacist
    { value: "", label: "Select Qualification" },
    { value: "D.Pharm", label: "D.Pharm" },
    { value: "B.Pharm", label: "B.Pharm" },
    { value: "M.Pharm", label: "M.Pharm" },
    { value: "Pharm.D", label: "Pharm.D" },
  ],
  4: [
    // Head Nurse
    { value: "", label: "Select Qualification" },
    { value: "Diploma in Nursing", label: "Diploma in Nursing" },
    { value: "BSc Nursing", label: "BSc Nursing" },
    { value: "MSc Nursing", label: "MSc Nursing" },
    { value: "GNM", label: "GNM" },
  ],
  6: [
    // Accountant
    { value: "", label: "Select Qualification" },
    { value: "B.Com", label: "B.Com" },
    { value: "M.Com", label: "M.Com" },
    { value: "CA", label: "CA" },
    { value: "CMA", label: "CMA" },
    { value: "MBA Finance", label: "MBA Finance" },
  ],
  9: [
    // Insurer
    { value: "", label: "Select Qualification" },
    { value: "Graduation", label: "Graduation" },
    { value: "MBA", label: "MBA" },
    { value: "Insurance Certification", label: "Insurance Certification" },
  ],
  8: [
    // Laboratorist
    { value: "", label: "Select Qualification" },
    { value: "DMLT", label: "DMLT" },
    { value: "BMLT", label: "BMLT" },
    { value: "MMLT", label: "MMLT" },
    { value: "BSc MLT", label: "BSc MLT" },
    { value: "MSc MLT", label: "MSc MLT" },
  ],
};

export const CHRONIC_CONDITIONS = [
  { value: "DIABETES_TYPE_2", label: "Diabetes Mellitus Type 2", icd10: "E11" },
  { value: "DIABETES_TYPE_1", label: "Diabetes Mellitus Type 1", icd10: "E10" },
  {
    value: "HYPERTENSION",
    label: "Hypertension (High Blood Pressure)",
    icd10: "I10",
  },
  {
    value: "CORONARY_ARTERY_DISEASE",
    label: "Coronary Artery Disease (CAD)",
    icd10: "I25",
  },
  { value: "HEART_FAILURE", label: "Heart Failure", icd10: "I50" },
  {
    value: "HYPERLIPIDEMIA",
    label: "Hyperlipidemia (High Cholesterol)",
    icd10: "E78",
  },
  { value: "OBESITY", label: "Obesity", icd10: "E66" },

  { value: "ASTHMA", label: "Asthma", icd10: "J45" },
  {
    value: "COPD",
    label: "Chronic Obstructive Pulmonary Disease",
    icd10: "J44",
  },
  { value: "PULMONARY_FIBROSIS", label: "Pulmonary Fibrosis", icd10: "J84" },
  { value: "BRONCHIECTASIS", label: "Bronchiectasis", icd10: "J47" },

  {
    value: "STROKE",
    label: "Stroke (Post-stroke complications)",
    icd10: "I63",
  },
  { value: "EPILEPSY", label: "Epilepsy", icd10: "G40" },
  { value: "PARKINSONS_DISEASE", label: "Parkinson’s Disease", icd10: "G20" },
  { value: "DEMENTIA", label: "Alzheimer’s Disease / Dementia", icd10: "F03" },
  { value: "MIGRAINE", label: "Migraine / Chronic Headache", icd10: "G43" },

  { value: "THYROID_DISORDER", label: "Thyroid Disorders", icd10: "E03" },
  { value: "PCOS", label: "Polycystic Ovary Syndrome (PCOS)", icd10: "E28" },
  { value: "OSTEOPOROSIS", label: "Osteoporosis", icd10: "M81" },

  {
    value: "CHRONIC_KIDNEY_DISEASE",
    label: "Chronic Kidney Disease (CKD)",
    icd10: "N18",
  },
  { value: "LIVER_CIRRHOSIS", label: "Liver Cirrhosis", icd10: "K74" },
  { value: "HEPATITIS_B_OR_C", label: "Hepatitis B/C (Chronic)", icd10: "B18" },

  { value: "IBS", label: "Irritable Bowel Syndrome (IBS)", icd10: "K58" },
  { value: "IBD", label: "Inflammatory Bowel Disease (IBD)", icd10: "K50" },
  {
    value: "CHRONIC_CONSTIPATION",
    label: "Chronic Constipation",
    icd10: "K59",
  },
  {
    value: "GERD",
    label: "Gastroesophageal Reflux Disease (GERD)",
    icd10: "K21",
  },

  { value: "OSTEOARTHRITIS", label: "Osteoarthritis", icd10: "M19" },
  {
    value: "RHEUMATOID_ARTHRITIS",
    label: "Rheumatoid Arthritis",
    icd10: "M06",
  },
  { value: "SPONDYLITIS", label: "Spondylitis", icd10: "M45" },
  { value: "CHRONIC_BACK_PAIN", label: "Chronic Back Pain", icd10: "M54" },

  { value: "BREAST_CANCER", label: "Breast Cancer", icd10: "C50" },
  { value: "PROSTATE_CANCER", label: "Prostate Cancer", icd10: "C61" },
  { value: "CERVICAL_CANCER", label: "Cervical Cancer", icd10: "C53" },
  { value: "LUNG_CANCER", label: "Lung Cancer", icd10: "C34" },
  { value: "COLORECTAL_CANCER", label: "Colorectal Cancer", icd10: "C18" },

  {
    value: "TUBERCULOSIS",
    label: "Tuberculosis (Latent or MDR-TB)",
    icd10: "A15",
  },
  { value: "HIV", label: "HIV/AIDS", icd10: "B20" },
  {
    value: "LEPROSY",
    label: "Leprosy (Post-treatment complications)",
    icd10: "A30",
  },

  { value: "DEPRESSION", label: "Depression", icd10: "F32" },
  { value: "ANXIETY", label: "Anxiety Disorders", icd10: "F41" },
  { value: "BIPOLAR_DISORDER", label: "Bipolar Disorder", icd10: "F31" },
  { value: "SCHIZOPHRENIA", label: "Schizophrenia", icd10: "F20" },
];

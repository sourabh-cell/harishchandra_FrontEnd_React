import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import forgotPasswordReducer from "../features/forgotPasswordSlice";
import statesReducer from "../features/statesSlice";
import employeeReducer from "../features/employeeSlice";
import departmentReducer from "../features/departmentSlice";
import assetsReducer from "../features/assetsSlice";
import healthPackageReducer from "../features/healthPackageSlice";
import birthAndDethReducer from "../features/birthAndDethSlice";
import doctorScheduleReducer from "../features/doctorScheduleSlice";
import bedReducer from "../features/bedSlice";
import ambulanceReducer from "../features/ambulanceSlice";
import bedManagerReducer from "../features/bedManagerSlice";
import priscriptionReducer from "../features/priscriptionSlice";
import noticeReducer from "../features/noticeSlice";
import commanReducer from "../features/commanSlice";
import appointmentReducer from "../features/appointmentSlice";
import doctorByDepartmentReducer from "../../src/features/doctorByDepartmentSlice";
import allocatedBedsReducer from "../features/allocatedBedsSlice";
import pathologyReducer from "../features/pathologySlice";
import radiologyReducer from "../features/radiologySlice";
import invoiceReducer from "../features/InvoiceSlice";
import patientReducer from "../features/patientAutoSuggestionSlice";
import createpatientvisitsReducer from "../features/createpatientvisitsSlice";
import patientVisitTableReducer from "../features/patientVisitTableSlice";
import patientRegistrationReducer from "../features/patientRegistrationSlice";
import medicineReducer from "../features/medicineSlice";
import pharmacyInventoryReducer from "../features/pharmacyInventorySlice";
import pharmacyPrescriptionReducer from "../features/pharmacyPrescriptionSlice";
import pharmacyInvoiceReducer from "../features/pharmacyInvoiceSlice";
import patientRegistrationListReducer from "../features/patientRegistrationListSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    forgotPassword: forgotPasswordReducer,
    states: statesReducer,
    employee: employeeReducer,
    departments: departmentReducer,
    assets: assetsReducer,
    healthPackages: healthPackageReducer,
    birthAndDeth: birthAndDethReducer,
    doctorSchedule: doctorScheduleReducer,
    beds: bedReducer,
    bedManager: bedManagerReducer,
    ambulance: ambulanceReducer,
    priscription: priscriptionReducer,
    notice: noticeReducer,
    comman: commanReducer,
    appointment: appointmentReducer,
    doctorsByDepartment: doctorByDepartmentReducer,
    allocatedBeds: allocatedBedsReducer,
    pathology: pathologyReducer,
    radiology: radiologyReducer,
    invoice: invoiceReducer,
    patients: patientReducer,
    patientVisits: createpatientvisitsReducer,
    patientVisitTable: patientVisitTableReducer,
    patientRegistration: patientRegistrationReducer,
    patientRegistrationList: patientRegistrationListReducer,
    medicine: medicineReducer,
    pharmacyInventory: pharmacyInventoryReducer,
    pharmacyPrescription: pharmacyPrescriptionReducer,
    pharmacyInvoice: pharmacyInvoiceReducer,
  },
});

export default store;

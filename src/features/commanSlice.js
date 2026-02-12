import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Add axios interceptor to include auth token in requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thunk to fetch all patients
export const fetchPatients = createAsyncThunk(
  "comman/fetchPatients",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/patients/all`);
      return res.data; // assume API returns array of patients
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk to fetch all departments
export const fetchDepartments = createAsyncThunk(
  "comman/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/department/all`);
      // Handle both direct array and wrapped response
      const data = res.data?.data || res.data;
      console.log("Departments API response:", data);
      return data;
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk to fetch medicine id-name mapping
export const fetchMedicines = createAsyncThunk(
  "comman/fetchMedicines",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/medicines/id-name`);
      return res.data; // returns { "1": "Paracetamol", "2": "Amoxicillin", ... }
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk to fetch doctors by department id
export const fetchDoctorsByDepartment = createAsyncThunk(
  "comman/fetchDoctorsByDepartment",
  async (departmentId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/doctor/${departmentId}`
      );
      // Handle both direct array and wrapped response
      const data = res.data?.data || res.data;
      console.log("Doctors API response for dept", departmentId, ":", data);
      return data;
    } catch (err) {
      console.error(
        "Failed to fetch doctors for department",
        departmentId,
        ":",
        err
      );
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk to fetch doctor name-id pairs for searching
export const fetchDoctorNameIds = createAsyncThunk(
  "comman/fetchDoctorNameIds",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/doctor/name-ids`);
      // debug: log the raw response to help diagnose empty suggestions
      // console.debug("fetchDoctorNameIds response:", res.data);
      // Expecting an array of { id, name } or mapping
      const data = res.data?.data || res.data;
      return data;
    } catch (err) {
      console.error("Failed to fetch doctor name-ids:", err);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk to fetch pharmacist name-id pairs
export const fetchPharmacistNameIds = createAsyncThunk(
  "comman/fetchPharmacistNameIds",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Pharmacist/name-ids`);
      const data = res.data?.data || res.data;
      console.log("Pharmacist name-ids API response:", data);
      return data;
    } catch (err) {
      console.error("Failed to fetch pharmacist name-ids:", err);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk to fetch active patient visits (name and id)
export const fetchActivePatientVisits = createAsyncThunk(
  "comman/fetchActivePatientVisits",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/patient-visits/active-names-and-ids`);
      const data = res.data?.data || res.data;
      console.log("Active patient visits API response:", data);
      return data;
    } catch (err) {
      console.error("Failed to fetch active patient visits:", err);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const commanSlice = createSlice({
  name: "comman",
  initialState: {
    patients: [],
    departments: [],
    doctors: [],
    doctorNameIds: [],
    medicines: {}, // { id: name } mapping
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    medicinesStatus: "idle",
    medicinesError: null,
    doctorsStatus: "idle",
    doctorsError: null,
    doctorNameIdsStatus: "idle",
    doctorNameIdsError: null,
    pharmacistNameIds: [],
    pharmacistNameIdsStatus: "idle",
    pharmacistNameIdsError: null,
    activePatientVisits: [],
    activePatientVisitsStatus: "idle",
    activePatientVisitsError: null,
  },
  reducers: {
    // optional reducers if needed in future
    clearPatients(state) {
      state.patients = [];
      state.status = "idle";
      state.error = null;
    },
    clearDepartments(state) {
      state.departments = [];
      state.departmentsStatus = "idle";
      state.departmentsError = null;
    },
    clearDoctors(state) {
      state.doctors = [];
      state.doctorsStatus = "idle";
      state.doctorsError = null;
    },
    clearMedicines(state) {
      state.medicines = {};
      state.medicinesStatus = "idle";
      state.medicinesError = null;
    },
    clearPharmacistNameIds(state) {
      state.pharmacistNameIds = [];
      state.pharmacistNameIdsStatus = "idle";
      state.pharmacistNameIdsError = null;
    },
    clearActivePatientVisits(state) {
      state.activePatientVisits = [];
      state.activePatientVisitsStatus = "idle";
      state.activePatientVisitsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Normalize payload if it's wrapped
        state.patients = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
    // departments reducers
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.departmentsStatus = "loading";
        state.departmentsError = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departmentsStatus = "succeeded";
        state.departments = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.departmentsStatus = "failed";
        state.departmentsError = action.payload || action.error.message;
      });
    // medicines reducers
    builder
      .addCase(fetchMedicines.pending, (state) => {
        state.medicinesStatus = "loading";
        state.medicinesError = null;
      })
      .addCase(fetchMedicines.fulfilled, (state, action) => {
        state.medicinesStatus = "succeeded";
        state.medicines = action.payload || {};
      })
      .addCase(fetchMedicines.rejected, (state, action) => {
        state.medicinesStatus = "failed";
        state.medicinesError = action.payload || action.error.message;
      });

    // doctors reducers
    builder
      .addCase(fetchDoctorsByDepartment.pending, (state) => {
        state.doctorsStatus = "loading";
        state.doctorsError = null;
      })
      .addCase(fetchDoctorsByDepartment.fulfilled, (state, action) => {
        state.doctorsStatus = "succeeded";
        state.doctors = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchDoctorsByDepartment.rejected, (state, action) => {
        state.doctorsStatus = "failed";
        state.doctorsError = action.payload || action.error.message;
      });

    // doctor name-ids reducers
    builder
      .addCase(fetchDoctorNameIds.pending, (state) => {
        state.doctorNameIdsStatus = "loading";
        state.doctorNameIdsError = null;
      })
      .addCase(fetchDoctorNameIds.fulfilled, (state, action) => {
        state.doctorNameIdsStatus = "succeeded";
        // normalize to array of objects
        if (Array.isArray(action.payload)) state.doctorNameIds = action.payload;
        else if (action.payload && typeof action.payload === "object") {
          // could be mapping {id: name}
          const arr = Object.keys(action.payload).map((k) => ({
            id: k,
            name: action.payload[k],
          }));
          state.doctorNameIds = arr;
        } else state.doctorNameIds = [];
      })
      .addCase(fetchDoctorNameIds.rejected, (state, action) => {
        state.doctorNameIdsStatus = "failed";
        state.doctorNameIdsError = action.payload || action.error.message;
      })

      // pharmacist name-ids reducers
      builder
      .addCase(fetchPharmacistNameIds.pending, (state) => {
        state.pharmacistNameIdsStatus = "loading";
        state.pharmacistNameIdsError = null;
      })
      .addCase(fetchPharmacistNameIds.fulfilled, (state, action) => {
        state.pharmacistNameIdsStatus = "succeeded";
        state.pharmacistNameIds = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchPharmacistNameIds.rejected, (state, action) => {
        state.pharmacistNameIdsStatus = "failed";
        state.pharmacistNameIdsError = action.payload || action.error.message;
      })

      // active patient visits reducers
      builder
        .addCase(fetchActivePatientVisits.pending, (state) => {
          state.activePatientVisitsStatus = "loading";
          state.activePatientVisitsError = null;
        })
        .addCase(fetchActivePatientVisits.fulfilled, (state, action) => {
          state.activePatientVisitsStatus = "succeeded";
          state.activePatientVisits = Array.isArray(action.payload)
            ? action.payload
            : action.payload?.data || [];
        })
        .addCase(fetchActivePatientVisits.rejected, (state, action) => {
          state.activePatientVisitsStatus = "failed";
          state.activePatientVisitsError = action.payload || action.error.message;
        });
  },
});

export const { clearPatients, clearDepartments, clearMedicines, clearDoctors, clearPharmacistNameIds, clearActivePatientVisits } =
  commanSlice.actions;

// Selectors
export const selectPatients = (state) => state.comman?.patients || [];
export const selectPatientsStatus = (state) => state.comman?.status || "idle";
export const selectPatientsError = (state) => state.comman?.error || null;

export const selectDepartments = (state) => state.comman?.departments || [];
export const selectDepartmentsStatus = (state) =>
  state.comman?.departmentsStatus || "idle";
export const selectDepartmentsError = (state) =>
  state.comman?.departmentsError || null;

export const selectMedicines = (state) => state.comman?.medicines || {};
export const selectMedicinesStatus = (state) =>
  state.comman?.medicinesStatus || "idle";
export const selectMedicinesError = (state) =>
  state.comman?.medicinesError || null;

// selector for doctor name ids
export const selectDoctorNameIds = (state) => state.comman?.doctorNameIds || [];
// console.log("Selector - Doctor Name IDs:", selectDoctorNameIds);
export const selectDoctorNameIdsStatus = (state) =>
  state.comman?.doctorNameIdsStatus || "idle";
export const selectDoctorNameIdsError = (state) =>
  state.comman?.doctorNameIdsError || null;

export default commanSlice.reducer;

// Selectors for doctors
export const selectDoctors = (state) => state.comman?.doctors || [];
export const selectDoctorsStatus = (state) =>
  state.comman?.doctorsStatus || "idle";
export const selectDoctorsError = (state) => state.comman?.doctorsError || null;

// Selectors for pharmacists
export const selectPharmacistNameIds = (state) => state.comman?.pharmacistNameIds || [];
export const selectPharmacistNameIdsStatus = (state) =>
  state.comman?.pharmacistNameIdsStatus || "idle";
export const selectPharmacistNameIdsError = (state) =>
  state.comman?.pharmacistNameIdsError || null;

// Selectors for active patient visits
export const selectActivePatientVisits = (state) => state.comman?.activePatientVisits || [];
export const selectActivePatientVisitsStatus = (state) =>
  state.comman?.activePatientVisitsStatus || "idle";
export const selectActivePatientVisitsError = (state) =>
  state.comman?.activePatientVisitsError || null;

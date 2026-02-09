import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getToken } from "../utils/authToken";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/patient-visits`;
const PATIENTS_API_URL = `${API_BASE_URL}/patients`;

// Create custom axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Attach JWT from local storage to every request
api.interceptors.request.use(
  (config) => {
    try {
      const token = getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore token errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Async thunk for creating patient visit (POST)
export const createPatientVisit = createAsyncThunk(
  "patientRegistrationList/create",
  async (visitData, { rejectWithValue }) => {
    try {
      console.log("=== Creating Patient Visit ===");
      console.log("Endpoint:", API_URL);
      console.log("Payload:", visitData);

      const res = await api.post("", visitData);

      console.log("Response status:", res.status);
      console.log("Response data:", res.data);
      console.log("=======================");

      return res.data;
    } catch (err) {
      console.error("=== Patient Visit Creation Failed ===");
      console.error("Error:", err.message);
      console.error("Response status:", err.response?.status);
      console.error("Response data:", err.response?.data);
      console.error("=============================");

      const payload = err.response
        ? {
            message: err.response.data?.message || err.response.data || err.message,
            status: err.response.status,
            url: err.config?.url,
          }
        : { message: err.message || "Network error", code: err.code };
      return rejectWithValue(payload);
    }
  }
);

// Async thunk for fetching all patient visits (GET)
export const fetchAllPatientVisits = createAsyncThunk(
  "patientRegistrationList/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk for deleting patient visit (DELETE)
export const deletePatientVisit = createAsyncThunk(
  "patientRegistrationList/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk for updating patient visit (PUT)
export const updatePatientVisit = createAsyncThunk(
  "patientRegistrationList/update",
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/${id}`, updateData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk for fetching patients from /api/patients (GET)
export const fetchPatients = createAsyncThunk(
  "patientRegistrationList/fetchPatients",
  async (_, { rejectWithValue }) => {
    try {
      console.log("=== Fetching Patients ===");
      console.log("Endpoint:", PATIENTS_API_URL);
      
      const response = await axios.get(PATIENTS_API_URL, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      
      console.log("Response status:", response.status);
      console.log("Response data:", JSON.stringify(response.data, null, 2));
      console.log("Response data type:", typeof response.data);
      console.log("Is array:", Array.isArray(response.data));
      console.log("=======================");
      
      return response.data;
    } catch (err) {
      console.error("=== Fetch Patients Failed ===");
      console.error("Error message:", err.message);
      console.error("Error code:", err.code);
      console.error("Response status:", err.response?.status);
      console.error("Response data:", err.response?.data);
      console.error("Request URL:", err.config?.url);
      console.error("=============================");
      
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  patients: [],
  patient: null,
  loading: false,
  error: null,
  success: false,
  message: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

const patientRegistrationListSlice = createSlice({
  name: "patientRegistrationList",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    clearPatient: (state) => {
      state.patient = null;
    },
    clearPatients: (state) => {
      state.patients = [];
    },
    setPatient: (state, action) => {
      state.patient = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create patient visit
      .addCase(createPatientVisit.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(createPatientVisit.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload?.message || "Patient visit created successfully";
        if (action.payload?.data) {
          state.patients.unshift(action.payload.data);
        }
      })
      .addCase(createPatientVisit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Fetch all patient visits
      .addCase(fetchAllPatientVisits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPatientVisits.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload?.data || action.payload || [];
      })
      .addCase(fetchAllPatientVisits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete patient visit
      .addCase(deletePatientVisit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePatientVisit.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Patient visit deleted successfully";
        state.patients = state.patients.filter(
          (patient) => patient.id !== action.payload
        );
      })
      .addCase(deletePatientVisit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update patient visit
      .addCase(updatePatientVisit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatientVisit.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload?.message || "Patient visit updated successfully";
        const index = state.patients.findIndex(
          (patient) => patient.id === action.payload?.data?.id || patient.id === action.payload.id
        );
        if (index !== -1) {
          state.patients[index] = action.payload?.data || action.payload;
        }
      })
      .addCase(updatePatientVisit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch patients from /api/patients
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearPatient,
  clearPatients,
  setPatient,
} = patientRegistrationListSlice.actions;

// Selectors
export const selectPatients = (state) => state.patientRegistrationList.patients;
export const selectPatient = (state) => state.patientRegistrationList.patient;
export const selectLoading = (state) => state.patientRegistrationList.loading;
export const selectError = (state) => state.patientRegistrationList.error;
export const selectSuccess = (state) => state.patientRegistrationList.success;
export const selectMessage = (state) => state.patientRegistrationList.message;

export default patientRegistrationListSlice.reducer;

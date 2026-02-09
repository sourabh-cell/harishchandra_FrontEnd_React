import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getToken } from "../utils/authToken";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create custom axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
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

// Create a new patient
export const createPatient = createAsyncThunk(
  "patientRegistration/create",
  async (patientData, { rejectWithValue }) => {
    try {
      console.log("=== Creating patient ===");
      console.log("Endpoint:", `${API_BASE_URL}/patients/create`);
      
      // Use FormData for backend compatibility
      const payload = new FormData();
      
      // Wrap all data in "patient" key as JSON string
      const patientPayload = {
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        email: patientData.email || "",
        dob: patientData.dob,
        age: patientData.age,
        gender: patientData.gender,
        occupation: patientData.occupation,
        bloodGroup: patientData.bloodGroup,
        contactInfo: patientData.contactInfo,
        emergencyContact: patientData.emergencyContact,
        idProofType: patientData.idProofType || "AADHAAR_CARD",
        idProofNumber: patientData.idProofNumber,
        maritalStatus: patientData.maritalStatus,
        note: patientData.note || "",
        addressDto: patientData.addressDto,
      };
      
      payload.append("patient", JSON.stringify(patientPayload));
      
      // Add file separately if present
      if (patientData.idProofFile && patientData.idProofFile instanceof File) {
        console.log("Adding file to payload:", patientData.idProofFile.name, patientData.idProofFile.type, patientData.idProofFile.size);
        payload.append("idProofFile", patientData.idProofFile);
      } else {
        console.log("No valid file to upload:", patientData.idProofFile);
      }

      console.log("Patient payload:", JSON.stringify(patientPayload, null, 2));
      console.log("Has file:", !!patientData.idProofFile);
      
      const res = await api.post("/patients/create", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.log("Response status:", res.status);
      console.log("Response data:", res.data);
      console.log("=======================");
      
      return res.data;
    } catch (err) {
      console.error("=== Patient creation failed ===");
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

const patientRegistrationSlice = createSlice({
  name: "patientRegistration",
  initialState: {
    patient: null,
    status: "idle", // idle | loading | succeeded | failed
    error: null,
    message: null,
  },
  reducers: {
    clearPatientRegistrationState: (state) => {
      state.patient = null;
      state.status = "idle";
      state.error = null;
      state.message = null;
    },
    clearStatus: (state) => {
      state.status = "idle";
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPatient.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.message = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.patient = action.payload;
        state.message = "Patient registered successfully!";
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.message = action.payload?.message || "Failed to register patient";
      });
  },
});

export const { clearPatientRegistrationState, clearStatus } = patientRegistrationSlice.actions;
export const selectPatientRegistration = (state) => state.patientRegistration;
export default patientRegistrationSlice.reducer;

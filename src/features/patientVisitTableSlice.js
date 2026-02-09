import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/patient-visits/all`;

// Async thunk for fetching all patient visits
export const fetchAllPatientVisits = createAsyncThunk(
  "patientVisitTable/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk for deleting a patient visit
export const deletePatientVisit = createAsyncThunk(
  "patientVisitTable/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/patient-visits/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk for updating a patient visit
export const updatePatientVisit = createAsyncThunk(
  "patientVisitTable/update",
  async ({ visitId, updateData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/patient-visits/update/${visitId}`, updateData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  visits: [],
  loading: false,
  error: null,
  success: false,
  message: null,
};

const patientVisitTableSlice = createSlice({
  name: "patientVisitTable",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    clearVisits: (state) => {
      state.visits = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all patient visits
      .addCase(fetchAllPatientVisits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPatientVisits.fulfilled, (state, action) => {
        state.loading = false;
        state.visits = action.payload;
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
        state.visits = state.visits.filter(
          (visit) => visit.id !== action.payload
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
        state.message = "Patient visit updated successfully";
        // Update the visit in the array - use original payload or construct from action
        const updatedVisit = action.payload || { id: action.meta.arg.visitId, ...action.meta.arg.updateData };
        const index = state.visits.findIndex(
          (visit) => visit.id === updatedVisit.id || visit.id === action.meta.arg.visitId
        );
        if (index !== -1) {
          state.visits[index] = { ...state.visits[index], ...updatedVisit };
        }
      })
      .addCase(updatePatientVisit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearVisits,
} = patientVisitTableSlice.actions;

// Selectors
export const selectVisits = (state) => state.patientVisitTable.visits;
export const selectLoading = (state) => state.patientVisitTable.loading;
export const selectError = (state) => state.patientVisitTable.error;
export const selectSuccess = (state) => state.patientVisitTable.success;

export default patientVisitTableSlice.reducer;

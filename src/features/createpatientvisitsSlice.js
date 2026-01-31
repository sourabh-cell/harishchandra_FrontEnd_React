import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = "/api/patient-visits";

// Async thunk for creating patient visit (POST)
export const createPatientVisit = createAsyncThunk(
  "patientVisits/create",
  async (visitData, { rejectWithValue }) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(visitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create patient visit");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching patient visits with pagination (Slice)
export const fetchPatientVisits = createAsyncThunk(
  "patientVisits/fetchAll",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch patient visits");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating patient visit (Merge/PUT)
export const updatePatientVisit = createAsyncThunk(
  "patientVisits/update",
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update patient visit");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting patient visit
export const deletePatientVisit = createAsyncThunk(
  "patientVisits/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete patient visit");
      }

      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for searching patient by hospital ID
export const searchPatientByHospitalId = createAsyncThunk(
  "patientVisits/searchByHospitalId",
  async (hospitalId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/search?hospitalId=${hospitalId}`);
      
      if (!response.ok) {
        throw new Error("Patient not found");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  visits: [],
  currentVisit: null,
  searchedPatient: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
  success: false,
  message: null,
};

const createpatientvisitsSlice = createSlice({
  name: "patientVisits",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    setCurrentVisit: (state, action) => {
      state.currentVisit = action.payload;
    },
    clearCurrentVisit: (state) => {
      state.currentVisit = null;
    },
    clearVisits: (state) => {
      state.visits = [];
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
        state.visits.unshift(action.payload?.data || action.payload);
      })
      .addCase(createPatientVisit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Fetch patient visits (Slice/Pagination)
      .addCase(fetchPatientVisits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientVisits.fulfilled, (state, action) => {
        state.loading = false;
        state.visits = action.payload?.data || action.payload;
        state.pagination = {
          page: action.payload?.page || 1,
          limit: action.payload?.limit || 10,
          total: action.payload?.total || action.payload?.data?.length || 0,
          totalPages: action.payload?.totalPages || 1,
        };
      })
      .addCase(fetchPatientVisits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update patient visit (Merge)
      .addCase(updatePatientVisit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatientVisit.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload?.message || "Patient visit updated successfully";
        const index = state.visits.findIndex(
          (visit) => visit.id === action.payload?.data?.id || visit.id === action.payload.id
        );
        if (index !== -1) {
          state.visits[index] = action.payload?.data || action.payload;
        }
      })
      .addCase(updatePatientVisit.rejected, (state, action) => {
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
      // Search patient by hospital ID
      .addCase(searchPatientByHospitalId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPatientByHospitalId.fulfilled, (state, action) => {
        state.loading = false;
        state.searchedPatient = action.payload;
      })
      .addCase(searchPatientByHospitalId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.searchedPatient = null;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentVisit,
  clearCurrentVisit,
  clearVisits,
} = createpatientvisitsSlice.actions;

export default createpatientvisitsSlice.reducer;

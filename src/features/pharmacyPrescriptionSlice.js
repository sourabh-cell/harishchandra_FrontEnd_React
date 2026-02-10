import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosConfig";

// GET /api/pharmacy/prescriptions
export const fetchAllPharmacyPrescriptions = createAsyncThunk(
  "pharmacyPrescription/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/pharmacy/prescriptions");
      return res.data;
    } catch (err) {
      if (err.response) {
        const message =
          err.response.data?.message || err.response.data || err.message;
        return rejectWithValue({
          message,
          status: err.response.status,
          url: err.config?.url,
        });
      }
      return rejectWithValue({ message: err.message || "Network error" });
    }
  }
);

const initialState = {
  prescriptions: [],
  fetchStatus: "idle",
  fetchError: null,
};

const pharmacyPrescriptionSlice = createSlice({
  name: "pharmacyPrescription",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPharmacyPrescriptions.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(fetchAllPharmacyPrescriptions.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        const list =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        state.prescriptions = Array.isArray(list) ? list : list ? [list] : [];
      })
      .addCase(fetchAllPharmacyPrescriptions.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = action.payload?.message || action.error?.message;
      });
  },
});

export default pharmacyPrescriptionSlice.reducer;

// Selectors
export const selectPharmacyPrescriptions = (state) => state.pharmacyPrescription?.prescriptions;
export const selectFetchPharmacyPrescriptionsStatus = (state) =>
  state.pharmacyPrescription?.fetchStatus;
export const selectFetchPharmacyPrescriptionsError = (state) =>
  state.pharmacyPrescription?.fetchError;

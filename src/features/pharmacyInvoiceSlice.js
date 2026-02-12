import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosConfig";

// Thunk to fetch all pharmacy invoices
export const fetchPharmacyInvoices = createAsyncThunk(
  "pharmacyInvoice/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/pharmacy/invoices");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const pharmacyInvoiceSlice = createSlice({
  name: "pharmacyInvoice",
  initialState: {
    invoices: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearInvoices(state) {
      state.invoices = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPharmacyInvoices.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPharmacyInvoices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.invoices = action.payload;
      })
      .addCase(fetchPharmacyInvoices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearInvoices } = pharmacyInvoiceSlice.actions;

// Selectors
export const selectPharmacyInvoices = (state) => state.pharmacyInvoice?.invoices || [];
export const selectPharmacyInvoicesStatus = (state) => state.pharmacyInvoice?.status || "idle";
export const selectPharmacyInvoicesError = (state) => state.pharmacyInvoice?.error || null;

export default pharmacyInvoiceSlice.reducer;

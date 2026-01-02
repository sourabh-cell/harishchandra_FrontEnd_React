import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchInvoiceFormData = createAsyncThunk(
  "invoice/fetchFormData",
  async (patientId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/invoice/form-data/${patientId}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const invoiceSlice = createSlice({
  name: "invoice",
  initialState: {
    formData: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearInvoiceState(state) {
      state.formData = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoiceFormData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInvoiceFormData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.formData = action.payload;
      })
      .addCase(fetchInvoiceFormData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const selectInvoiceFormData = (state) => state.invoice.formData;
export default invoiceSlice.reducer;

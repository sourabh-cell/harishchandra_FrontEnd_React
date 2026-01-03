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

export const createInvoice = createAsyncThunk(
  "invoice/create",
  async (invoiceData, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/invoice`,
        invoiceData
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchAllInvoices = createAsyncThunk(
  "invoice/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/invoice/all`);
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
    invoices: [],
    status: "idle",
    createStatus: "idle",
    fetchAllStatus: "idle",
    error: null,
    createError: null,
    fetchAllError: null,
  },
  reducers: {
    clearInvoiceState(state) {
      state.formData = null;
      state.status = "idle";
      state.error = null;
    },
    clearCreateInvoiceState(state) {
      state.createStatus = "idle";
      state.createError = null;
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
      })
      .addCase(createInvoice.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.createError = null;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload;
      })
      .addCase(fetchAllInvoices.pending, (state) => {
        state.fetchAllStatus = "loading";
        state.fetchAllError = null;
      })
      .addCase(fetchAllInvoices.fulfilled, (state, action) => {
        state.fetchAllStatus = "succeeded";
        state.invoices = action.payload;
        state.fetchAllError = null;
      })
      .addCase(fetchAllInvoices.rejected, (state, action) => {
        state.fetchAllStatus = "failed";
        state.fetchAllError = action.payload;
      });
  },
});

export const { clearInvoiceState, clearCreateInvoiceState } = invoiceSlice.actions;
export const selectInvoiceFormData = (state) => state.invoice.formData;
export const selectAllInvoices = (state) => state.invoice.invoices;
export const selectFetchAllStatus = (state) => state.invoice.fetchAllStatus;
export default invoiceSlice.reducer;

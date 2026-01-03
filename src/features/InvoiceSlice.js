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

const invoiceSlice = createSlice({
  name: "invoice",
  initialState: {
    formData: null,
    status: "idle",
    createStatus: "idle",
    error: null,
    createError: null,
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
      });
  },
});

export const selectInvoiceFormData = (state) => state.invoice.formData;
export default invoiceSlice.reducer;

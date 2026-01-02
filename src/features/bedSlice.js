import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({ baseURL: API_BASE_URL });

// Add a new bed using form-data
export const addBed = createAsyncThunk(
  "beds/addBed",
  async (formData, { rejectWithValue }) => {
    try {
      // Expecting `formData` to be an instance of FormData
      const res = await api.post("/beds/form-data", formData, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    } catch (err) {
      const message = err.response?.data || err.message || "Network error";
      return rejectWithValue(message);
    }
  }
);

// Optional: fetch all beds
export const fetchBeds = createAsyncThunk(
  "beds/fetchBeds",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/beds");
      return res.data;
    } catch (err) {
      const message = err.response?.data || err.message || "Network error";
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  beds: [],
  status: "idle",
  error: null,
  addStatus: "idle",
  addError: null,
};

const bedSlice = createSlice({
  name: "beds",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBeds.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBeds.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload && action.payload.data) {
          state.beds = Array.isArray(action.payload.data)
            ? action.payload.data
            : [action.payload.data];
        } else if (Array.isArray(action.payload)) {
          state.beds = action.payload;
        } else if (action.payload) {
          state.beds = [action.payload];
        } else {
          state.beds = [];
        }
      })
      .addCase(fetchBeds.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // add bed
      .addCase(addBed.pending, (state) => {
        state.addStatus = "loading";
        state.addError = null;
      })
      .addCase(addBed.fulfilled, (state, action) => {
        state.addStatus = "succeeded";
        const created =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        if (created) {
          if (Array.isArray(created)) state.beds = [...created, ...state.beds];
          else state.beds.unshift(created);
        }
      })
      .addCase(addBed.rejected, (state, action) => {
        state.addStatus = "failed";
        state.addError = action.payload || action.error.message;
      });
  },
});

export default bedSlice.reducer;

// Selectors
export const selectBeds = (state) => state.beds?.beds;
export const selectBedsStatus = (state) => state.beds?.status;
export const selectBedsError = (state) => state.beds?.error;
export const selectAddBedStatus = (state) => state.beds?.addStatus;
export const selectAddBedError = (state) => state.beds?.addError;

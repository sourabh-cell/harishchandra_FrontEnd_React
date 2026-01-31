import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
 
export const fetchPatients = createAsyncThunk(
  "patients/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/patients/names-and-ids`);
      // Handle both direct array response and wrapped { data: [...] } response
      const data = res.data;
      // If response has a data property that's an array, use it
      if (data && Array.isArray(data)) {
        return data;
      }
      // If response has data.data as an array, use it
      if (data && data.data && Array.isArray(data.data)) {
        return data.data;
      }
      // Fallback: return empty array if not valid
      return [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const patientSlice = createSlice({
  name: "patients",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const selectPatients = (state) => state.patients.list;
export const selectPatientsStatus = (state) => state.patients.status;
export default patientSlice.reducer;
 
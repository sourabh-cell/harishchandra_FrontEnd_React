import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { fetchBedsList } from "./bedManagerSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 🔹 Fetch Allotted Beds
export const fetchAllocatedBeds = createAsyncThunk(
  "allocatedBeds/fetchAllocatedBeds",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/allocated`);
      return response.data;
    } catch (error) {
      const payload = error.response?.data;
      return rejectWithValue(
        typeof payload === "object"
          ? payload.message || JSON.stringify(payload)
          : payload || "Something went wrong"
      );
    }
  }
);

// Release Bed
export const releaseBed = createAsyncThunk(
  "allocatedBeds/releaseBed",
  async (bedAssignmentId, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/release/${bedAssignmentId}`
      );

      // Refresh allocated bed list after release
      dispatch(fetchAllocatedBeds());
      // Also refresh beds list so the vacant/assigned counts update
      dispatch(fetchBedsList());

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data || "Failed to release bed");
    }
  }
);

const allocatedBedsSlice = createSlice({
  name: "allocatedBeds",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllocatedBeds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAllocatedBeds.fulfilled, (state, action) => {
        state.loading = false;

        // Always return array to prevent errors
        const raw = action.payload;

        state.data = Array.isArray(raw) ? raw : raw ? [raw] : [];
      })

      .addCase(fetchAllocatedBeds.rejected, (state, action) => {
        state.loading = false;

        const payload = action.payload;

        // Convert error to clean string
        state.error =
          typeof payload === "object"
            ? payload.message || JSON.stringify(payload)
            : payload || "Request failed";
      })
      // Release
      .addCase(releaseBed.pending, (state) => {
        state.loading = true;
      })
      .addCase(releaseBed.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(releaseBed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default allocatedBedsSlice.reducer;

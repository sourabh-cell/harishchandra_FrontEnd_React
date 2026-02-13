import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// POST to /api/v1/blood-donors
export const addDonor = createAsyncThunk(
  "donor/addDonor",
  async (donorData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/v1/blood-donors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(donorData),
      });

      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue({ status: res.status, message: text || res.statusText });
      }

      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue({ message: err.message });
    }
  }
);

// GET all donors from /api/v1/blood-donors
export const fetchAllDonors = createAsyncThunk(
  "donor/fetchAllDonors",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/v1/blood-donors`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue({ status: res.status, message: text || res.statusText });
      }

      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue({ message: err.message });
    }
  }
);

const donorSlice = createSlice({
  name: "donor",
  initialState: {
    items: [],
    item: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearState(state) {
      state.item = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Donor
      .addCase(addDonor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addDonor.fulfilled, (state, action) => {
        state.loading = false;
        state.item = action.payload;
        state.success = true;
      })
      .addCase(addDonor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
        state.success = false;
      })
      // Fetch All Donors
      .addCase(fetchAllDonors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDonors.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllDonors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      });
  },
});

export const { clearState } = donorSlice.actions;
export default donorSlice.reducer;

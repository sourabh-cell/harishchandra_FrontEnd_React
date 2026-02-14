import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// POST to /api/v1/blood-donations
export const addDonation = createAsyncThunk(
  "donation/addDonation",
  async (donationData, { rejectWithValue }) => {
    try {
      console.log("Sending donation data:", donationData);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/v1/blood-donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(donationData),
      });

      const data = await res.json();
      console.log("Response status:", res.status);
      console.log("Response data:", data);
      
      if (!res.ok) {
        return rejectWithValue({ 
          status: res.status, 
          message: data.message || data.error || "Failed to add donation" 
        });
      }

      return data;
    } catch (err) {
      console.error("Error adding donation:", err);
      return rejectWithValue({ message: err.message });
    }
  }
);

// GET all donations from /api/v1/blood-donations
export const fetchAllDonations = createAsyncThunk(
  "donation/fetchAllDonations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/v1/blood-donations`, {
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

const donationSlice = createSlice({
  name: "donation",
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
      // Add Donation
      .addCase(addDonation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addDonation.fulfilled, (state, action) => {
        state.loading = false;
        state.item = action.payload;
        state.success = true;
      })
      .addCase(addDonation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
        state.success = false;
      })
      // Fetch All Donations
      .addCase(fetchAllDonations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDonations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllDonations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      });
  },
});

export const { clearState } = donationSlice.actions;
export default donationSlice.reducer;

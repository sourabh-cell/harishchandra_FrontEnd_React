import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// POST to /api/v1/blood-donors
export const addDonor = createAsyncThunk(
  "donor/addDonor",
  async (donorData, { rejectWithValue }) => {
    try {
      const res = await fetch("http://192.168.1.38:8080/api/v1/blood-donors", {
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

const donorSlice = createSlice({
  name: "donor",
  initialState: {
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
      });
  },
});

export const { clearState } = donorSlice.actions;
export default donorSlice.reducer;

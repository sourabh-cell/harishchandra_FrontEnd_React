// src/features/states/statesSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Async thunk to fetch states
export const fetchStates = createAsyncThunk("states/fetchStates", async () => {
  const response = await axios.get(`${API_BASE_URL}/data/states`);
  return response.data;
});

const statesSlice = createSlice({
  name: "states",
  initialState: {
    list: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default statesSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch doctors by department
export const fetchDoctorsByDepartment = createAsyncThunk(
  "doctors/fetchByDepartment",
  async (departmentId) => {
    const response = await axios.get(
      `${API_BASE_URL}/doctor/doctors/${departmentId}`
    );
    return response.data; // API returns list of doctors
  }
);

const doctorByDepartmentSlice = createSlice({
  name: "doctorsByDepartment",
  initialState: {
    doctorsByDept: [],
    doctorsByDeptStatus: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctorsByDepartment.pending, (state) => {
        state.doctorsByDeptStatus = "loading";
        state.error = null;
      })
      .addCase(fetchDoctorsByDepartment.fulfilled, (state, action) => {
        state.doctorsByDeptStatus = "succeeded";
        state.doctorsByDept = action.payload;
      })
      .addCase(fetchDoctorsByDepartment.rejected, (state, action) => {
        state.doctorsByDeptStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export default doctorByDepartmentSlice.reducer;

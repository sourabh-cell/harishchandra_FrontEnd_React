import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 1️⃣ Create Async Thunk for Posting Form Data
export const registerEmployee = createAsyncThunk(
  "employee/registerEmployee",
  async (employeeData, { rejectWithValue }) => {
    try {
      console.log("Employee Data to be sent:", employeeData);

      // ✅ Extract token correctly
      const stored = localStorage.getItem("auth"); // or "authUser" depending on your storage key
      const token = stored ? JSON.parse(stored).token : null;

      // ✅ Build headers with token
      let headers = {
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      if (employeeData instanceof FormData) {
        // If it's FormData (with files), let browser set boundary automatically
        headers["Content-Type"] = "multipart/form-data";
      } else {
        // If it's a regular object (no files), send as JSON
        headers["Content-Type"] = "application/json";
      }

      const response = await axios.post(
        `${API_BASE_URL}/register/add`,
        employeeData,
        { headers } // ✅ always include token + content-type
      );

      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Registration Error:", error);
      console.error("Error Response:", error.response?.data);

      // ✅ Return full error array if available
      if (error.response?.data) {
        return rejectWithValue(error.response.data);
      }

      // Fallback to generic message
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

// Fetch employees by roleId
export const fetchEmployeesByRole = createAsyncThunk(
  "employee/fetchByRole",
  async (roleId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/role/${roleId}`);
      // ensure we return an array; backend may wrap the data
      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : data?.dataList ?? data?.data ?? data?.users ?? [];
      return { roleId, list };
    } catch (error) {
      console.error("fetchEmployeesByRole error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update employee status
export const updateEmployeeStatus = createAsyncThunk(
  "employee/updateStatus",
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      await axios.put(`${API_BASE_URL}/users/${userId}/status`, { status });
      return { userId, status };
    } catch (error) {
      console.error("updateEmployeeStatus error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 2️⃣ Slice
const employeeSlice = createSlice({
  name: "employee",
  initialState: {
    loading: false,
    success: false,
    error: null,
    message: null,
    // store employees by roleId to avoid re-fetching when switching tabs
    employeesByRole: {},
    fetchingRole: null,
  },
  reducers: {
    resetEmployeeState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerEmployee.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = null;
      })
      .addCase(registerEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // prefer a 'message' property from the API payload when available
        state.message = action.payload?.message ?? null;
      })
      .addCase(registerEmployee.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
        state.message = null;
      });
    // fetch employees by role
    builder
      .addCase(fetchEmployeesByRole.pending, (state, action) => {
        state.loading = true;
        state.fetchingRole = action.meta.arg;
        state.error = null;
      })
      .addCase(fetchEmployeesByRole.fulfilled, (state, action) => {
        state.loading = false;
        state.fetchingRole = null;
        const { roleId, list } = action.payload;
        state.employeesByRole[roleId] = list;
      })
      .addCase(fetchEmployeesByRole.rejected, (state, action) => {
        state.loading = false;
        state.fetchingRole = null;
        state.error = action.payload;
      })
      // update status
      .addCase(updateEmployeeStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployeeStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, status } = action.payload;
        // find and update user across stored role lists
        Object.keys(state.employeesByRole).forEach((roleKey) => {
          state.employeesByRole[roleKey] = state.employeesByRole[roleKey].map(
            (emp) => (emp.userId === userId ? { ...emp, status } : emp)
          );
        });
      })
      .addCase(updateEmployeeStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetEmployeeState } = employeeSlice.actions;
export default employeeSlice.reducer;

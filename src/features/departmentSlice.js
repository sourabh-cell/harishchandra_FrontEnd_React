import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ Async thunk to fetch all departments from form-data endpoint
export const fetchDepartments = createAsyncThunk(
  "departments/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      // Some environments set a global Authorization header after login.
      // This endpoint should be public (no JWT). Temporarily remove the
      // global header for this request and restore it afterwards.
      const prevAuth = axios?.defaults?.headers?.common?.Authorization;
      if (
        axios &&
        axios.defaults &&
        axios.defaults.headers &&
        axios.defaults.headers.common
      ) {
        delete axios.defaults.headers.common.Authorization;
      }

      let response;
      try {
        response = await axios.get(`${API_BASE_URL}/register/form-data`);
      } finally {
        // restore previous Authorization header (if any)
        if (
          axios &&
          axios.defaults &&
          axios.defaults.headers &&
          axios.defaults.headers.common
        ) {
          if (typeof prevAuth !== "undefined")
            axios.defaults.headers.common.Authorization = prevAuth;
          else delete axios.defaults.headers.common.Authorization;
        }
      }
      // console.log("fetchDepartments API response:", response.data);
      // helpful debug log when running locally
      // console.debug("fetchDepartments response:", response.data);
      return response.data.departments; // extract departments from the response
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch departments"
      );
    }
  }
);

// ✅ New async thunk to fetch all departments for management
export const fetchAllDepartments = createAsyncThunk(
  "departments/fetchAllDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/department/all`);
      console.log("fetchAllDepartments API response:", response.data);
      return response.data; // Return the array of departments
    } catch (error) {
      console.error("fetchAllDepartments error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch all departments"
      );
    }
  }
);

// ✅ Async thunk to add a new department
export const addDepartment = createAsyncThunk(
  "departments/addDepartment",
  async (departmentData, { rejectWithValue }) => {
    try {
      console.log("Adding department:", departmentData);
      const response = await axios.post(
        `${API_BASE_URL}/department/add`,
        departmentData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("addDepartment API response:", response.data);
      return response.data; // Return the created department
    } catch (error) {
      console.error("addDepartment error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to add department"
      );
    }
  }
);

// ✅ Async thunk to update an existing department
export const updateDepartment = createAsyncThunk(
  "departments/updateDepartment",
  async ({ id, departmentData }, { rejectWithValue }) => {
    try {
      console.log("Updating department:", id, departmentData);
      const response = await axios.put(
        `${API_BASE_URL}/department/update/${id}`,
        departmentData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("updateDepartment API response:", response.data);
      return response.data; // Return the updated department
    } catch (error) {
      console.error("updateDepartment error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update department"
      );
    }
  }
);

// ✅ Async thunk to fetch a single department by ID
export const fetchDepartmentById = createAsyncThunk(
  "departments/fetchDepartmentById",
  async (id, { rejectWithValue }) => {
    try {
      console.log("Fetching department by ID:", id);
      const response = await axios.get(`${API_BASE_URL}/department/${id}`);
      console.log("fetchDepartmentById API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("fetchDepartmentById error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch department"
      );
    }
  }
);

// ✅ Async thunk to delete a department
export const deleteDepartment = createAsyncThunk(
  "departments/deleteDepartment",
  async (id, { rejectWithValue }) => {
    try {
      console.log("Deleting department with ID:", id);
      const response = await axios.delete(
        `${API_BASE_URL}/department/delete/${id}`
      );
      console.log("deleteDepartment API response:", response.data);
      return id; // Return ID for updating local state
    } catch (error) {
      console.error("deleteDepartment error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete department"
      );
    }
  }
);

const departmentSlice = createSlice({
  name: "departments",
  initialState: {
    list: [],
    allDepartments: [], // New state for all departments
    currentDepartment: null, // Current department being viewed/edited
    status: "idle",
    allDepartmentsStatus: "idle", // Separate status for all departments
    addDepartmentStatus: "idle", // Status for adding department
    updateDepartmentStatus: "idle", // Status for updating department
    currentDepartmentStatus: "idle", // Status for fetching single department
    deleteDepartmentStatus: "idle", // Status for deleting department
    error: null,
    allDepartmentsError: null, // Separate error for all departments
    addDepartmentError: null, // Error for adding department
    addDepartmentMessage: null, // Success message for adding department
    updateDepartmentError: null, // Error for updating department
    updateDepartmentMessage: null, // Success message for updating department
    currentDepartmentError: null, // Error for fetching single department
    deleteDepartmentError: null, // Error for deleting department
    deleteDepartmentMessage: null, // Success message for deleting department
  },
  reducers: {
    // Optional: for manual adding or resetting if needed
    resetDepartments: (state) => {
      state.list = [];
      state.error = null;
      state.status = "idle";
    },
    resetAllDepartments: (state) => {
      state.allDepartments = [];
      state.allDepartmentsError = null;
      state.allDepartmentsStatus = "idle";
    },
    resetAddDepartment: (state) => {
      state.addDepartmentStatus = "idle";
      state.addDepartmentError = null;
      state.addDepartmentMessage = null;
    },
    resetUpdateDepartment: (state) => {
      state.updateDepartmentStatus = "idle";
      state.updateDepartmentError = null;
      state.updateDepartmentMessage = null;
    },
    resetCurrentDepartment: (state) => {
      state.currentDepartment = null;
      state.currentDepartmentStatus = "idle";
      state.currentDepartmentError = null;
    },
    resetDeleteDepartment: (state) => {
      state.deleteDepartmentStatus = "idle";
      state.deleteDepartmentError = null;
      state.deleteDepartmentMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Something went wrong";
      })
      // Handle fetchAllDepartments
      .addCase(fetchAllDepartments.pending, (state) => {
        state.allDepartmentsStatus = "loading";
        state.allDepartmentsError = null;
      })
      .addCase(fetchAllDepartments.fulfilled, (state, action) => {
        state.allDepartmentsStatus = "succeeded";
        state.allDepartments = action.payload;
      })
      .addCase(fetchAllDepartments.rejected, (state, action) => {
        state.allDepartmentsStatus = "failed";
        state.allDepartmentsError = action.payload || "Something went wrong";
      })
      // Handle addDepartment
      .addCase(addDepartment.pending, (state) => {
        state.addDepartmentStatus = "loading";
        state.addDepartmentError = null;
        state.addDepartmentMessage = null;
      })
      .addCase(addDepartment.fulfilled, (state, action) => {
        state.addDepartmentStatus = "succeeded";
        state.addDepartmentMessage = "Department added successfully";
        // Optionally add the new department to the allDepartments list
        if (action.payload) {
          state.allDepartments.push(action.payload);
        }
      })
      .addCase(addDepartment.rejected, (state, action) => {
        state.addDepartmentStatus = "failed";
        state.addDepartmentError = action.payload || "Failed to add department";
      })
      // Handle updateDepartment
      .addCase(updateDepartment.pending, (state) => {
        state.updateDepartmentStatus = "loading";
        state.updateDepartmentError = null;
        state.updateDepartmentMessage = null;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.updateDepartmentStatus = "succeeded";
        state.updateDepartmentMessage = "Department updated successfully";
        // Update the department in allDepartments list
        if (action.payload) {
          const index = state.allDepartments.findIndex(
            (dept) => dept.id === action.payload.id
          );
          if (index !== -1) {
            state.allDepartments[index] = action.payload;
          }
        }
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.updateDepartmentStatus = "failed";
        state.updateDepartmentError =
          action.payload || "Failed to update department";
      })
      // Handle fetchDepartmentById
      .addCase(fetchDepartmentById.pending, (state) => {
        state.currentDepartmentStatus = "loading";
        state.currentDepartmentError = null;
      })
      .addCase(fetchDepartmentById.fulfilled, (state, action) => {
        state.currentDepartmentStatus = "succeeded";
        state.currentDepartment = action.payload;
      })
      .addCase(fetchDepartmentById.rejected, (state, action) => {
        state.currentDepartmentStatus = "failed";
        state.currentDepartmentError =
          action.payload || "Failed to fetch department";
      })
      // Handle deleteDepartment
      .addCase(deleteDepartment.pending, (state) => {
        state.deleteDepartmentStatus = "loading";
        state.deleteDepartmentError = null;
        state.deleteDepartmentMessage = null;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.deleteDepartmentStatus = "succeeded";
        state.deleteDepartmentMessage = "Department deleted successfully";
        // Remove the deleted department from allDepartments list
        state.allDepartments = state.allDepartments.filter(
          (dept) => dept.id !== action.payload
        );
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.deleteDepartmentStatus = "failed";
        state.deleteDepartmentError =
          action.payload || "Failed to delete department";
      });
  },
});

export const {
  resetDepartments,
  resetAllDepartments,
  resetAddDepartment,
  resetUpdateDepartment,
  resetCurrentDepartment,
  resetDeleteDepartment,
} = departmentSlice.actions;
export default departmentSlice.reducer;

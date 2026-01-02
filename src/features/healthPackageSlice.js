import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Async thunk to fetch all health packages
export const fetchHealthPackages = createAsyncThunk(
  "healthPackages/fetchHealthPackages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health-package`);
      console.log("fetchHealthPackages API response:", response.data);

      // Normalize common response shapes into an array of packages
      const payload = response.data;
      if (Array.isArray(payload)) {
        return payload;
      }

      // If payload is an object, try common properties (include dataList)
      const maybeArray =
        payload?.dataList ||
        payload?.data ||
        payload?.healthPackages ||
        payload?.packages ||
        payload?.content ||
        [];

      // Also handle nested shapes like payload.data.content or payload.data.dataList
      if (!Array.isArray(maybeArray) && payload?.data) {
        const nested = payload.data?.dataList || payload.data?.content || [];
        return Array.isArray(nested) ? nested : [];
      }

      return Array.isArray(maybeArray) ? maybeArray : [];
    } catch (error) {
      console.error("fetchHealthPackages error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch health packages"
      );
    }
  }
);

// Async thunk to add a new health package
export const addHealthPackage = createAsyncThunk(
  "healthPackages/addHealthPackage",
  async (packageData, { rejectWithValue }) => {
    try {
      console.log("Adding health package:", packageData);
      let config = {};

      if (packageData instanceof FormData) {
        // If it's FormData (with files), DON'T set Content-Type header here.
        // Let the browser/axios set the proper multipart boundary automatically.
        config = {};
      } else {
        // If it's a regular object (no files), send as JSON
        config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
      }

      const response = await axios.post(
        `${API_BASE_URL}/health-package`,
        packageData,
        config
      );
      console.log("addHealthPackage API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("addHealthPackage error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to add health package"
      );
    }
  }
);

// Async thunk to update a health package
export const updateHealthPackage = createAsyncThunk(
  "healthPackages/updateHealthPackage",
  async ({ id, packageData }, { rejectWithValue }) => {
    try {
      console.log("Updating health package:", id, packageData);

      // Don't set Content-Type header - let axios handle it for FormData
      const config = {};

      const response = await axios.put(
        `${API_BASE_URL}/health-package/${id}`,
        packageData,
        config
      );
      console.log("updateHealthPackage API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("updateHealthPackage error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update health package"
      );
    }
  }
);

// Async thunk to delete a health package
export const deleteHealthPackage = createAsyncThunk(
  "healthPackages/deleteHealthPackage",
  async (id, { rejectWithValue }) => {
    try {
      console.log("Deleting health package:", id);
      const response = await axios.delete(
        `${API_BASE_URL}/health-package/delete/${id}`
      );
      console.log("deleteHealthPackage API response:", response.data);
      return id; // Return the deleted package ID
    } catch (error) {
      console.error("deleteHealthPackage error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete health package"
      );
    }
  }
);

const initialState = {
  packages: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  message: null,
};

const healthPackageSlice = createSlice({
  name: "healthPackages",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch health packages
      .addCase(fetchHealthPackages.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchHealthPackages.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Ensure we always set an array
        state.packages = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchHealthPackages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.packages = []; // Reset to empty array on error
      })
      // Add health package
      .addCase(addHealthPackage.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addHealthPackage.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Ensure state.packages is an array before pushing
        if (Array.isArray(state.packages)) {
          state.packages.push(action.payload);
        } else {
          state.packages = [action.payload];
        }
        state.message = "Health package added successfully";
        state.error = null;
      })
      .addCase(addHealthPackage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update health package
      .addCase(updateHealthPackage.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateHealthPackage.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Ensure state.packages is an array before updating
        if (Array.isArray(state.packages)) {
          const index = state.packages.findIndex(
            (pkg) => pkg.id === action.payload.id
          );
          if (index !== -1) {
            state.packages[index] = action.payload;
          }
        }
        state.message = "Health package updated successfully";
        state.error = null;
      })
      .addCase(updateHealthPackage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete health package
      .addCase(deleteHealthPackage.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteHealthPackage.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Ensure state.packages is an array before filtering
        if (Array.isArray(state.packages)) {
          state.packages = state.packages.filter(
            (pkg) => pkg.id !== action.payload
          );
        }
        state.message = "Health package deleted successfully";
        state.error = null;
      })
      .addCase(deleteHealthPackage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearError, clearMessage } = healthPackageSlice.actions;
export default healthPackageSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ Async thunk to fetch all assets
export const fetchAllAssets = createAsyncThunk(
  "assets/fetchAllAssets",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching all assets...");
      const response = await axios.get(`${API_BASE_URL}/assets/view`);
      console.log("fetchAllAssets API response:", response.data);
      // Extract the content array from the nested response
      return response.data.data.content || [];
    } catch (error) {
      console.error("fetchAllAssets error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch assets"
      );
    }
  }
);

// ✅ Async thunk to fetch a single asset by ID
export const fetchAssetById = createAsyncThunk(
  "assets/fetchAssetById",
  async (id, { rejectWithValue }) => {
    try {
      console.log("Fetching asset by ID:", id);
      const response = await axios.get(`${API_BASE_URL}/assets/${id}`);
      console.log("fetchAssetById API response:", response.data);
      // Extract data from nested response structure
      return response.data.data || response.data;
    } catch (error) {
      console.error("fetchAssetById error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch asset"
      );
    }
  }
);

// ✅ Async thunk to add a new asset
export const addAsset = createAsyncThunk(
  "assets/addAsset",
  async (assetData, { rejectWithValue }) => {
    try {
      console.log("=== SLICE: Adding asset ===");
      console.log("Received assetData:", assetData);
      console.log("Status in slice:", assetData.status);
      console.log("Full JSON payload:", JSON.stringify(assetData, null, 2));

      const response = await axios.post(
        `${API_BASE_URL}/assets/add`,
        assetData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("addAsset API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("addAsset error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to add asset"
      );
    }
  }
);

// ✅ Async thunk to update an existing asset
export const updateAsset = createAsyncThunk(
  "assets/updateAsset",
  async ({ id, assetData }, { rejectWithValue }) => {
    try {
      console.log("Updating asset:", id, assetData);
      const response = await axios.put(
        `${API_BASE_URL}/assets/${id}`,
        assetData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("updateAsset API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("updateAsset error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update asset"
      );
    }
  }
);

// ✅ Async thunk to delete an asset
export const deleteAsset = createAsyncThunk(
  "assets/deleteAsset",
  async (id, { rejectWithValue }) => {
    try {
      console.log("Deleting asset with ID:", id);
      const response = await axios.delete(`${API_BASE_URL}/assets/${id}`);
      console.log("deleteAsset API response:", response.data);
      return id; // Return ID for updating local state
    } catch (error) {
      console.error("deleteAsset error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete asset"
      );
    }
  }
);

const assetsSlice = createSlice({
  name: "assets",
  initialState: {
    allAssets: [], // List of all assets
    currentAsset: null, // Current asset being viewed/edited
    allAssetsStatus: "idle", // Status for fetching all assets
    currentAssetStatus: "idle", // Status for fetching single asset
    addAssetStatus: "idle", // Status for adding asset
    updateAssetStatus: "idle", // Status for updating asset
    deleteAssetStatus: "idle", // Status for deleting asset
    allAssetsError: null, // Error for fetching all assets
    currentAssetError: null, // Error for fetching single asset
    addAssetError: null, // Error for adding asset
    addAssetMessage: null, // Success message for adding asset
    updateAssetError: null, // Error for updating asset
    updateAssetMessage: null, // Success message for updating asset
    deleteAssetError: null, // Error for deleting asset
    deleteAssetMessage: null, // Success message for deleting asset
  },
  reducers: {
    resetAllAssets: (state) => {
      state.allAssets = [];
      state.allAssetsError = null;
      state.allAssetsStatus = "idle";
    },
    resetCurrentAsset: (state) => {
      state.currentAsset = null;
      state.currentAssetStatus = "idle";
      state.currentAssetError = null;
    },
    resetAddAsset: (state) => {
      state.addAssetStatus = "idle";
      state.addAssetError = null;
      state.addAssetMessage = null;
    },
    resetUpdateAsset: (state) => {
      state.updateAssetStatus = "idle";
      state.updateAssetError = null;
      state.updateAssetMessage = null;
    },
    resetDeleteAsset: (state) => {
      state.deleteAssetStatus = "idle";
      state.deleteAssetError = null;
      state.deleteAssetMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAllAssets
      .addCase(fetchAllAssets.pending, (state) => {
        state.allAssetsStatus = "loading";
        state.allAssetsError = null;
      })
      .addCase(fetchAllAssets.fulfilled, (state, action) => {
        state.allAssetsStatus = "succeeded";
        state.allAssets = action.payload;
      })
      .addCase(fetchAllAssets.rejected, (state, action) => {
        state.allAssetsStatus = "failed";
        state.allAssetsError = action.payload || "Failed to fetch assets";
      })
      // Handle fetchAssetById
      .addCase(fetchAssetById.pending, (state) => {
        state.currentAssetStatus = "loading";
        state.currentAssetError = null;
      })
      .addCase(fetchAssetById.fulfilled, (state, action) => {
        state.currentAssetStatus = "succeeded";
        state.currentAsset = action.payload;
      })
      .addCase(fetchAssetById.rejected, (state, action) => {
        state.currentAssetStatus = "failed";
        state.currentAssetError = action.payload || "Failed to fetch asset";
      })
      // Handle addAsset
      .addCase(addAsset.pending, (state) => {
        state.addAssetStatus = "loading";
        state.addAssetError = null;
        state.addAssetMessage = null;
      })
      .addCase(addAsset.fulfilled, (state, action) => {
        state.addAssetStatus = "succeeded";
        state.addAssetMessage = "Asset added successfully";
        // Add the new asset to the allAssets list
        if (action.payload) {
          state.allAssets.push(action.payload);
        }
      })
      .addCase(addAsset.rejected, (state, action) => {
        state.addAssetStatus = "failed";
        state.addAssetError = action.payload || "Failed to add asset";
      })
      // Handle updateAsset
      .addCase(updateAsset.pending, (state) => {
        state.updateAssetStatus = "loading";
        state.updateAssetError = null;
        state.updateAssetMessage = null;
      })
      .addCase(updateAsset.fulfilled, (state, action) => {
        state.updateAssetStatus = "succeeded";
        state.updateAssetMessage = "Asset updated successfully";
        // Update the asset in allAssets list
        if (action.payload) {
          const index = state.allAssets.findIndex(
            (asset) => asset.id === action.payload.id
          );
          if (index !== -1) {
            state.allAssets[index] = action.payload;
          }
        }
      })
      .addCase(updateAsset.rejected, (state, action) => {
        state.updateAssetStatus = "failed";
        state.updateAssetError = action.payload || "Failed to update asset";
      })
      // Handle deleteAsset
      .addCase(deleteAsset.pending, (state) => {
        state.deleteAssetStatus = "loading";
        state.deleteAssetError = null;
        state.deleteAssetMessage = null;
      })
      .addCase(deleteAsset.fulfilled, (state, action) => {
        state.deleteAssetStatus = "succeeded";
        state.deleteAssetMessage = "Asset deleted successfully";
        // Remove the deleted asset from allAssets list
        state.allAssets = state.allAssets.filter(
          (asset) => asset.id !== action.payload
        );
      })
      .addCase(deleteAsset.rejected, (state, action) => {
        state.deleteAssetStatus = "failed";
        state.deleteAssetError = action.payload || "Failed to delete asset";
      });
  },
});

export const {
  resetAllAssets,
  resetCurrentAsset,
  resetAddAsset,
  resetUpdateAsset,
  resetDeleteAsset,
} = assetsSlice.actions;

export default assetsSlice.reducer;

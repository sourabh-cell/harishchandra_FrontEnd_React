import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosConfig";

// GET /api/pharmacy/inventory
export const fetchInventory = createAsyncThunk(
  "pharmacyInventory/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/pharmacy/inventory");
      return res.data;
    } catch (err) {
      if (err.response) {
        const message =
          err.response.data?.message || err.response.data || err.message;
        return rejectWithValue({
          message,
          status: err.response.status,
          url: err.config?.url,
        });
      }
      return rejectWithValue({ message: err.message || "Network error" });
    }
  }
);

// POST /api/pharmacy/inventory
export const addInventoryItem = createAsyncThunk(
  "pharmacyInventory/addItem",
  async (item, { rejectWithValue }) => {
    console.log("addInventoryItem received:", item);
    try {
      const res = await axiosInstance.post("/pharmacy/inventory", item, {
        headers: { "Content-Type": "application/json" }
      });
      return res.data;
    } catch (err) {
      if (err.response) {
        const respData = err.response.data;
        const errors = Array.isArray(respData)
          ? respData
          : respData?.errors || respData?.fieldErrors || undefined;
        const message =
          typeof respData === "string"
            ? respData
            : respData?.message || respData || err.message;
        return rejectWithValue({
          message,
          status: err.response.status,
          url: err.config?.url,
          errors,
        });
      }
      return rejectWithValue({
        message: err.message || "Network error",
        code: err.code,
      });
    }
  }
);

// PUT /api/pharmacy/inventory/{inventoryId}
export const updateInventoryItem = createAsyncThunk(
  "pharmacyInventory/updateItem",
  async ({ inventoryId, item }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/pharmacy/inventory/${inventoryId}`, item, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    } catch (err) {
      if (err.response) {
        const respData = err.response.data;
        const errors = Array.isArray(respData)
          ? respData
          : respData?.errors || respData?.fieldErrors || undefined;
        const message =
          typeof respData === "string"
            ? respData
            : respData?.message || respData || err.message;
        return rejectWithValue({
          message,
          status: err.response.status,
          url: err.config?.url,
          errors,
        });
      }
      return rejectWithValue({
        message: err.message || "Network error",
        code: err.code,
      });
    }
  }
);

// DELETE /api/pharmacy/inventory/{inventoryId}
export const deleteInventoryItem = createAsyncThunk(
  "pharmacyInventory/deleteItem",
  async (inventoryId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/pharmacy/inventory/${inventoryId}`);
      return inventoryId;
    } catch (err) {
      if (err.response) {
        const message =
          err.response.data?.message || err.response.data || err.message;
        return rejectWithValue({
          message,
          status: err.response.status,
          url: err.config?.url,
        });
      }
      return rejectWithValue({ message: err.message || "Network error" });
    }
  }
);

const initialState = {
  inventory: [],
  fetchStatus: "idle",
  fetchError: null,
  addStatus: "idle",
  addError: null,
  addErrors: null,
  deleteStatus: "idle",
  deleteError: null,
  updateStatus: "idle",
  updateError: null,
  updateErrors: null,
};

const pharmacyInventorySlice = createSlice({
  name: "pharmacyInventory",
  initialState,
  reducers: {
    clearAddError: (state) => {
      state.addError = null;
      state.addErrors = null;
    },
    clearAddSuccess: (state) => {
      state.addStatus = "idle";
    },
    clearDeleteError: (state) => {
      state.deleteError = null;
    },
    clearUpdateError: (state) => {
      state.updateError = null;
      state.updateErrors = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Inventory
      .addCase(fetchInventory.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        const list =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        state.inventory = Array.isArray(list) ? list : list ? [list] : [];
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = action.payload?.message || action.error?.message;
      })

      // Add Inventory Item
      .addCase(addInventoryItem.pending, (state) => {
        state.addStatus = "loading";
        state.addError = null;
        state.addErrors = null;
      })
      .addCase(addInventoryItem.fulfilled, (state, action) => {
        state.addStatus = "succeeded";
        const created =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        if (created) {
          if (Array.isArray(created))
            state.inventory = [...created, ...state.inventory];
          else state.inventory.unshift(created);
        }
      })
      .addCase(addInventoryItem.rejected, (state, action) => {
        state.addStatus = "failed";
        state.addError = action.payload?.message || action.error?.message;
        state.addErrors = action.payload?.errors;
      })

      // Delete Inventory Item
      .addCase(deleteInventoryItem.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.inventory = state.inventory.filter(
          (item) => item.inventoryId !== action.payload
        );
      })
      .addCase(deleteInventoryItem.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.payload?.message || action.error?.message;
      })

      // Update Inventory Item
      .addCase(updateInventoryItem.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
        state.updateErrors = null;
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const updated =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        if (updated) {
          const index = state.inventory.findIndex(
            (item) => item.inventoryId === updated.inventoryId
          );
          if (index !== -1) {
            state.inventory[index] = updated;
          }
        }
      })
      .addCase(updateInventoryItem.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload?.message || action.error.message;
        state.updateErrors = action.payload?.errors || null;
      });
  },
});

export default pharmacyInventorySlice.reducer;

// Action creators
export const { 
  clearAddError, 
  clearAddSuccess,
  clearDeleteError,
  clearUpdateError 
} = pharmacyInventorySlice.actions;

// Selectors
export const selectInventory = (state) => state.pharmacyInventory?.inventory;
export const selectInventoryFetchStatus = (state) =>
  state.pharmacyInventory?.fetchStatus;
export const selectInventoryFetchError = (state) =>
  state.pharmacyInventory?.fetchError;
export const selectInventoryAddStatus = (state) =>
  state.pharmacyInventory?.addStatus;
export const selectInventoryAddError = (state) =>
  state.pharmacyInventory?.addError;
export const selectInventoryAddErrors = (state) =>
  state.pharmacyInventory?.addErrors;
export const selectInventoryDeleteStatus = (state) =>
  state.pharmacyInventory?.deleteStatus;
export const selectInventoryDeleteError = (state) =>
  state.pharmacyInventory?.deleteError;
export const selectInventoryUpdateStatus = (state) =>
  state.pharmacyInventory?.updateStatus || "idle";
export const selectInventoryUpdateError = (state) =>
  state.pharmacyInventory?.updateError;
export const selectInventoryUpdateErrors = (state) =>
  state.pharmacyInventory?.updateErrors;

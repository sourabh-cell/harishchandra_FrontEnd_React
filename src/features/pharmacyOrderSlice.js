import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosConfig";

// GET /api/pharmacy/orders
export const fetchOrders = createAsyncThunk(
  "pharmacyOrder/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/pharmacy/orders");
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

// GET /api/pharmacy/orders/all
export const fetchAllOrders = createAsyncThunk(
  "pharmacyOrder/fetchAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/pharmacy/orders/all");
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

// POST /api/pharmacy/orders/create
export const createOrder = createAsyncThunk(
  "pharmacyOrder/create",
  async (orderData, { rejectWithValue }) => {
    console.log("createOrder received:", orderData);
    try {
      const res = await axiosInstance.post("/pharmacy/orders/create", orderData, {
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

// PUT /api/pharmacy/orders/{id}
export const updateOrder = createAsyncThunk(
  "pharmacyOrder/update",
  async ({ orderId, orderData }, { rejectWithValue }) => {
    console.log("updateOrder received:", orderId, orderData);
    try {
      const res = await axiosInstance.put(`/pharmacy/orders/${orderId}`, orderData, {
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

// PUT /api/pharmacy/orders/{id}/status/{status}
export const updateOrderStatus = createAsyncThunk(
  "pharmacyOrder/updateStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    console.log("updateOrderStatus received:", orderId, status);
    try {
      const res = await axiosInstance.put(`/pharmacy/orders/${orderId}/status/${status}`);
      return res.data;
    } catch (err) {
      if (err.response) {
        const respData = err.response.data;
        const message =
          typeof respData === "string"
            ? respData
            : respData?.message || respData || err.message;
        return rejectWithValue({
          message,
          status: err.response.status,
          url: err.config?.url,
        });
      }
      return rejectWithValue({
        message: err.message || "Network error",
        code: err.code,
      });
    }
  }
);

// PUT /api/pharmacy/orders/process-received/{orderId}
export const processReceivedOrder = createAsyncThunk(
  "pharmacyOrder/processReceived",
  async ({ orderId, receivedData }, { rejectWithValue }) => {
    console.log("processReceivedOrder received:", orderId, receivedData);
    try {
      const res = await axiosInstance.put(`/pharmacy/orders/process-received/${orderId}`, receivedData, {
        headers: { "Content-Type": "application/json" }
      });
      return res.data;
    } catch (err) {
      if (err.response) {
        const respData = err.response.data;
        const message =
          typeof respData === "string"
            ? respData
            : respData?.message || respData || err.message;
        return rejectWithValue({
          message,
          status: err.response.status,
          url: err.config?.url,
        });
      }
      return rejectWithValue({
        message: err.message || "Network error",
        code: err.code,
      });
    }
  }
);

const initialState = {
  orders: [],
  allOrders: [],
  fetchStatus: "idle",
  fetchError: null,
  fetchAllOrdersStatus: "idle",
  fetchAllOrdersError: null,
  createStatus: "idle",
  createError: null,
  createErrors: null,
  updateStatus: "idle",
  updateError: null,
  updateErrors: null,
};

const pharmacyOrderSlice = createSlice({
  name: "pharmacyOrder",
  initialState,
  reducers: {
    clearCreateError: (state) => {
      state.createError = null;
      state.createErrors = null;
    },
    clearCreateSuccess: (state) => {
      state.createStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        const list =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        state.orders = Array.isArray(list) ? list : list ? [list] : [];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = action.payload?.message || action.error?.message;
      })

      // Fetch All Orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.fetchAllOrdersStatus = "loading";
        state.fetchAllOrdersError = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.fetchAllOrdersStatus = "succeeded";
        state.allOrders = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.fetchAllOrdersStatus = "failed";
        state.fetchAllOrdersError = action.payload?.message || action.error?.message;
      })

      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
        state.createErrors = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        const created =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        if (created) {
          if (Array.isArray(created))
            state.orders = [...created, ...state.orders];
          else state.orders.unshift(created);
        }
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload?.message || action.error?.message;
        state.createErrors = action.payload?.errors;
      })

      // Update Order
      .addCase(updateOrder.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
        state.updateErrors = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const updated =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        if (updated) {
          // Update the order in the allOrders array
          const index = state.allOrders.findIndex(o => o.id === updated.id);
          if (index !== -1) {
            state.allOrders[index] = updated;
          }
          // Also update in orders array if exists
          const orderIndex = state.orders.findIndex(o => o.id === updated.id);
          if (orderIndex !== -1) {
            state.orders[orderIndex] = updated;
          }
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload?.message || action.error?.message;
        state.updateErrors = action.payload?.errors;
      })

      // Update Order Status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updated =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        if (updated) {
          // Update the order in the allOrders array
          const index = state.allOrders.findIndex(o => o.id === updated.id);
          if (index !== -1) {
            state.allOrders[index] = updated;
          }
          // Also update in orders array if exists
          const orderIndex = state.orders.findIndex(o => o.id === updated.id);
          if (orderIndex !== -1) {
            state.orders[orderIndex] = updated;
          }
        }
      })

      // Process Received Order
      .addCase(processReceivedOrder.fulfilled, (state, action) => {
        const updated =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        if (updated) {
          // Update the order in the allOrders array
          const index = state.allOrders.findIndex(o => o.id === updated.id);
          if (index !== -1) {
            state.allOrders[index] = updated;
          }
          // Also update in orders array if exists
          const orderIndex = state.orders.findIndex(o => o.id === updated.id);
          if (orderIndex !== -1) {
            state.orders[orderIndex] = updated;
          }
        }
      });
  },
});

export default pharmacyOrderSlice.reducer;

// Action creators
export const { 
  clearCreateError, 
  clearCreateSuccess
} = pharmacyOrderSlice.actions;

// Selectors
export const selectOrders = (state) => state.pharmacyOrder?.orders;
export const selectOrdersFetchStatus = (state) =>
  state.pharmacyOrder?.fetchStatus;
export const selectOrdersFetchError = (state) =>
  state.pharmacyOrder?.fetchError;
export const selectAllOrders = (state) => state.pharmacyOrder?.allOrders;
export const selectAllOrdersFetchStatus = (state) =>
  state.pharmacyOrder?.fetchAllOrdersStatus;
export const selectAllOrdersFetchError = (state) =>
  state.pharmacyOrder?.fetchAllOrdersError;
export const selectOrderCreateStatus = (state) =>
  state.pharmacyOrder?.createStatus;
export const selectOrderCreateError = (state) =>
  state.pharmacyOrder?.createError;
export const selectOrderCreateErrors = (state) =>
  state.pharmacyOrder?.createErrors;
export const selectOrderUpdateStatus = (state) =>
  state.pharmacyOrder?.updateStatus;
export const selectOrderUpdateError = (state) =>
  state.pharmacyOrder?.updateError;

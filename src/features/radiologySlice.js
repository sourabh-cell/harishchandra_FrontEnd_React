import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getToken } from "../utils/authToken";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Thunk to fetch radiology technicians
export const fetchRadiologyTechnicians = createAsyncThunk(
  "radiology/fetchRadiologyTechnicians",
  async (_, { rejectWithValue }) => {
    try { 
      const token = getToken();
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await axios.get(
        `${API_BASE_URL}/laboratorists/radiology-technicians`,
        { headers }
      );
      const data = res.data?.data || res.data;
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk to fetch all radiology reports
export const fetchRadiologies = createAsyncThunk(
  "radiology/fetchRadiologies",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await axios.get(`${API_BASE_URL}/radiology/all`, { headers });
      const data = res.data?.data || res.data;
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Fetch single radiology by id (GET /radiology/{reportId})
export const fetchRadiologyById = createAsyncThunk(
  "radiology/fetchRadiologyById",
  async (reportId, { rejectWithValue }) => {
    try {
      const token = getToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      console.log("API Call - Fetching radiology for ID:", reportId);
      const res = await axios.get(`${API_BASE_URL}/radiology/${reportId}`, {
        headers,
      });
      const data = res.data?.data || res.data;
      console.log("API Response - Radiology data:", data);
      return data;
    } catch (err) {
      const payloadErr = err.response
        ? {
            message:
              err.response.data?.message || err.response.data || err.message,
            status: err.response.status,
            url: err.config?.url,
          }
        : { message: err.message || "Network error", code: err.code };
      return rejectWithValue(payloadErr);
    }
  }
);

// Create radiology report (POST /radiology/create)
export const createRadiology = createAsyncThunk(
  "radiology/createRadiology",
  async (payload, { rejectWithValue }) => {
    try {
      const token = getToken();
      // If payload is FormData (file upload), let axios set Content-Type (including boundary)
      const isFormData =
        typeof FormData !== "undefined" && payload instanceof FormData;
      const headers = {};
      if (!isFormData) headers["Content-Type"] = "application/json";
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.post(
        `${API_BASE_URL}/radiology/create`,
        payload,
        {
          headers,
        }
      );
      return res.data;
    } catch (err) {
      const payloadErr = err.response
        ? {
            message:
              err.response.data?.message || err.response.data || err.message,
            status: err.response.status,
            url: err.config?.url,
          }
        : { message: err.message || "Network error", code: err.code };
      return rejectWithValue(payloadErr);
    }
  }
);

// Update radiology report (PUT /radiology/update/:id)
export const updateRadiology = createAsyncThunk(
  "radiology/updateRadiology",
  async ({ id, payload }, { rejectWithValue, dispatch }) => {
    try {
      const token = getToken();
      const isFormData =
        typeof FormData !== "undefined" && payload instanceof FormData;
      const headers = {};
      if (!isFormData) headers["Content-Type"] = "application/json";
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.put(
        `${API_BASE_URL}/radiology/update/${id}`,
        payload,
        { headers }
      );
      // Refresh the list after successful update
      dispatch(fetchRadiologies());
      return res.data;
    } catch (err) {
      const payloadErr = err.response
        ? {
            message:
              err.response.data?.message || err.response.data || err.message,
            status: err.response.status,
            url: err.config?.url,
          }
        : { message: err.message || "Network error", code: err.code };
      return rejectWithValue(payloadErr);
    }
  }
);

// Update radiology status (PUT /radiology/status/:reportId/:status)
export const updateRadiologyStatus = createAsyncThunk(
  "radiology/updateRadiologyStatus",
  async ({ reportId, status }, { rejectWithValue }) => {
    try {
      const token = getToken();
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      console.log("Updating radiology status - reportId:", reportId, "status:", status);
      const res = await axios.put(
        `${API_BASE_URL}/radiology/status/${reportId}/${status}`,
        {},
        { headers }
      );
      return { reportId, status, data: res.data };
    } catch (err) {
      console.error("Error updating radiology status:", err);
      const payloadErr = err.response
        ? {
            message:
              err.response.data?.message || err.response.data || err.message,
            status: err.response.status,
            url: err.config?.url,
          }
        : { message: err.message || "Network error", code: err.code };
      return rejectWithValue(payloadErr);
    }
  }
);

// Delete radiology report (DELETE /radiology/delete/:id)
export const deleteRadiology = createAsyncThunk(
  "radiology/deleteRadiology",
  async (id, { rejectWithValue }) => {
    try {
      const token = getToken();
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.delete(
        `${API_BASE_URL}/radiology/delete/${id}`,
        { headers }
      );
      return { id, data: res.data };
    } catch (err) {
      const payloadErr = err.response
        ? {
            message:
              err.response.data?.message || err.response.data || err.message,
            status: err.response.status,
            url: err.config?.url,
          }
        : { message: err.message || "Network error", code: err.code };
      return rejectWithValue(payloadErr);
    }
  }
);

const initialState = {
  createStatus: "idle",
  createError: null,
  lastCreated: null,
  technicians: [],
  techniciansStatus: "idle",
  techniciansError: null,
  updateStatus: "idle",
  updateError: null,
  lastUpdated: null,
  radiologies: [],
  radiologiesStatus: "idle",
  radiologiesError: null,
  fetchRadiologyStatus: "idle",
  fetchRadiologyError: null,
  currentRadiology: null,
  statusUpdateStatus: "idle",
  statusUpdateError: null,
  deleteStatus: "idle",
  deleteError: null,
};

const radiologySlice = createSlice({
  name: "radiology",
  initialState,
  reducers: {
    resetCreateState(state) {
      state.createStatus = "idle";
      state.createError = null;
      state.lastCreated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRadiology.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createRadiology.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.lastCreated = action.payload || null;
      })
      .addCase(createRadiology.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload || action.error.message;
      });
    // update radiology
    builder
      .addCase(updateRadiology.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateRadiology.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const updated = action.payload?.data || action.payload || null;
        state.lastUpdated = updated;
        // If we have a radiologies array, replace the updated item
        if (
          Array.isArray(state.radiologies) &&
          updated &&
          (updated.id || updated._id)
        ) {
          const updatedId = updated.id || updated._id;
          state.radiologies = state.radiologies.map((r) =>
            String(r.id || r._id) === String(updatedId)
              ? { ...r, ...updated }
              : r
          );
        }
      })
      .addCase(updateRadiology.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload || action.error.message;
      });
    // update radiology status
    builder
      .addCase(updateRadiologyStatus.pending, (state) => {
        state.statusUpdateStatus = "loading";
        state.statusUpdateError = null;
      })
      .addCase(updateRadiologyStatus.fulfilled, (state, action) => {
        state.statusUpdateStatus = "succeeded";
        const { reportId, status } = action.payload;
        // update status in cached radiologies array
        if (Array.isArray(state.radiologies)) {
          const idx = state.radiologies.findIndex(
            (r) => String(r.id || r._id) === String(reportId)
          );
          if (idx !== -1) {
            state.radiologies[idx].reportStatus = status;
          }
        }
      })
      .addCase(updateRadiologyStatus.rejected, (state, action) => {
        state.statusUpdateStatus = "failed";
        state.statusUpdateError = action.payload || action.error.message;
      });
    // delete radiology
    builder
      .addCase(deleteRadiology.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deleteRadiology.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        const { id } = action.payload;
        // remove from cached radiologies array
        if (Array.isArray(state.radiologies)) {
          state.radiologies = state.radiologies.filter(
            (r) => String(r.id || r._id) !== String(id)
          );
        }
      })
      .addCase(deleteRadiology.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.payload || action.error.message;
      });
    // fetch radiology technicians
    builder
      .addCase(fetchRadiologyTechnicians.pending, (state) => {
        state.techniciansStatus = "loading";
        state.techniciansError = null;
      })
      .addCase(fetchRadiologyTechnicians.fulfilled, (state, action) => {
        state.techniciansStatus = "succeeded";
        state.technicians = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchRadiologyTechnicians.rejected, (state, action) => {
        state.techniciansStatus = "failed";
        state.techniciansError = action.payload || action.error.message;
      });
    // fetch all radiology reports
    builder
      .addCase(fetchRadiologies.pending, (state) => {
        state.radiologiesStatus = "loading";
        state.radiologiesError = null;
      })
      .addCase(fetchRadiologies.fulfilled, (state, action) => {
        state.radiologiesStatus = "succeeded";
        state.radiologies = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchRadiologies.rejected, (state, action) => {
        state.radiologiesStatus = "failed";
        state.radiologiesError = action.payload || action.error.message;
      });
    // fetch single radiology by id
    builder
      .addCase(fetchRadiologyById.pending, (state) => {
        state.fetchRadiologyStatus = "loading";
        state.fetchRadiologyError = null;
      })
      .addCase(fetchRadiologyById.fulfilled, (state, action) => {
        state.fetchRadiologyStatus = "succeeded";
        state.currentRadiology = action.payload || null;
      })
      .addCase(fetchRadiologyById.rejected, (state, action) => {
        state.fetchRadiologyStatus = "failed";
        state.fetchRadiologyError = action.payload || action.error.message;
      });
  },
});

export const { resetCreateState } = radiologySlice.actions;

export default radiologySlice.reducer;

// Selectors
export const selectCreateRadiologyStatus = (state) =>
  state.radiology?.createStatus || "idle";
export const selectCreateRadiologyError = (state) =>
  state.radiology?.createError || null;
export const selectLastCreatedRadiology = (state) =>
  state.radiology?.lastCreated || null;

// selectors for technicians
export const selectRadiologyTechnicians = (state) =>
  state.radiology?.technicians || [];
export const selectRadiologyTechniciansStatus = (state) =>
  state.radiology?.techniciansStatus || "idle";
export const selectRadiologyTechniciansError = (state) =>
  state.radiology?.techniciansError || null;

// selectors for radiologies
export const selectRadiologies = (state) => state.radiology?.radiologies || [];
export const selectRadiologiesStatus = (state) =>
  state.radiology?.radiologiesStatus || "idle";
export const selectRadiologiesError = (state) =>
  state.radiology?.radiologiesError || null;
// selectors for single radiology
export const selectCurrentRadiology = (state) =>
  state.radiology?.currentRadiology || null;
export const selectFetchRadiologyStatus = (state) =>
  state.radiology?.fetchRadiologyStatus || "idle";
export const selectFetchRadiologyError = (state) =>
  state.radiology?.fetchRadiologyError || null;

// selectors for update
export const selectUpdateRadiologyStatus = (state) =>
  state.radiology?.updateStatus || "idle";
export const selectUpdateRadiologyError = (state) =>
  state.radiology?.updateError || null;
export const selectLastUpdatedRadiology = (state) =>
  state.radiology?.lastUpdated || null;

// selectors for status update
export const selectStatusUpdateRadiologyStatus = (state) =>
  state.radiology?.statusUpdateStatus || "idle";
export const selectStatusUpdateRadiologyError = (state) =>
  state.radiology?.statusUpdateError || null;

// selectors for delete
export const selectDeleteRadiologyStatus = (state) =>
  state.radiology?.deleteStatus || "idle";
export const selectDeleteRadiologyError = (state) =>
  state.radiology?.deleteError || null;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getToken } from "../utils/authToken";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create pathology report (POST /pathology/create)
export const createPathology = createAsyncThunk(
  "pathology/createPathology",
  async (payload, { rejectWithValue }) => {
    try {
      const token = getToken();
      // debug token presence (will be visible in browser console)
      console.debug("fetchPathologies - token present:", !!token);
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.post(
        `${API_BASE_URL}/pathology/create`,
        payload,
        { headers }
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

// Fetch lab technicians (GET /laboratorists/pathlab-technicians)
export const fetchLabTechnicians = createAsyncThunk(
  "pathology/fetchLabTechnicians",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.get(
        `${API_BASE_URL}/laboratorists/pathlab-technicians`,
        { headers }
      );
      const data = res.data?.data || res.data;
      console.debug("fetchLabTechnicians response:", data);
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

// Fetch all pathology reports (GET /pathology/all)
export const fetchPathologies = createAsyncThunk(
  "pathology/fetchPathologies",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.get(`${API_BASE_URL}/pathology/all`, { headers });
      const data = res.data?.data || res.data;
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

// Update pathology report (PUT /pathology/update/{reportId})
export const updatePathology = createAsyncThunk(
  "pathology/updatePathology",
  async ({ reportId, payload }, { rejectWithValue }) => {
    try {
      const token = getToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.put(
        `${API_BASE_URL}/pathology/update/${reportId}`,
        payload,
        { headers }
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

// Fetch single pathology by id (GET /pathology/{reportId})
export const fetchPathologyById = createAsyncThunk(
  "pathology/fetchPathologyById",
  async (reportId, { rejectWithValue }) => {
    try {
      const token = getToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.get(`${API_BASE_URL}/pathology/${reportId}`, {
        headers,
      });
      const data = res.data?.data || res.data;
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

// Update pathology status (PUT /pathology/status/{reportId}/{status})
export const updatePathologyStatus = createAsyncThunk(
  "pathology/updatePathologyStatus",
  async ({ reportId, status }, { rejectWithValue }) => {
    try {
      const token = getToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.put(
        `${API_BASE_URL}/pathology/status/${reportId}/${status}`,
        {},
        { headers }
      );
      return { reportId, status, data: res.data };
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

// Delete pathology report (DELETE /pathology/{reportId})
export const deletePathology = createAsyncThunk(
  "pathology/deletePathology",
  async (reportId, { rejectWithValue }) => {
    try {
      const token = getToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.delete(`${API_BASE_URL}/pathology/${reportId}`, {
        headers,
      });
      return { reportId, data: res.data };
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
  pathologies: [],
  pathologiesStatus: "idle",
  pathologiesError: null,
  labTechnicians: [],
  labTechniciansStatus: "idle",
  labTechniciansError: null,
  updateStatus: "idle",
  updateError: null,
  lastUpdated: null,
  currentPathology: null,
  fetchPathologyStatus: "idle",
  fetchPathologyError: null,
  statusUpdateStatus: "idle",
  statusUpdateError: null,
};

const pathologySlice = createSlice({
  name: "pathology",
  initialState,
  reducers: {
    resetCreateState(state) {
      state.createStatus = "idle";
      state.createError = null;
      state.lastCreated = null;
    },
    // Remove pathology from local cached list (client-side only)
    removePathologyFromCache(state, action) {
      const id = action.payload;
      if (!id) return;
      if (Array.isArray(state.pathologies)) {
        state.pathologies = state.pathologies.filter(
          (p) => String(p.id || p._id) !== String(id)
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPathology.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createPathology.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.lastCreated = action.payload || null;
      })
      .addCase(createPathology.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload || action.error.message;
      });

    // fetch pathologies reducers
    builder
      .addCase(fetchPathologies.pending, (state) => {
        state.pathologiesStatus = "loading";
        state.pathologiesError = null;
      })
      .addCase(fetchPathologies.fulfilled, (state, action) => {
        state.pathologiesStatus = "succeeded";
        state.pathologies = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchPathologies.rejected, (state, action) => {
        state.pathologiesStatus = "failed";
        state.pathologiesError = action.payload || action.error.message;
      });

    // update pathology reducers
    builder
      .addCase(updatePathology.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updatePathology.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.lastUpdated = action.payload || null;
        // try to replace the updated item in cached list
        try {
          const updated = action.payload;
          const id = updated?.id || updated?._id || updated?.reportId;
          if (id && Array.isArray(state.pathologies)) {
            const idx = state.pathologies.findIndex(
              (p) => String(p.id || p._id || p.reportId) === String(id)
            );
            if (idx !== -1) state.pathologies[idx] = updated;
          }
        } catch (e) {
          // ignore update-on-cache errors
        }
      })
      .addCase(updatePathology.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload || action.error.message;
      });

    // fetch single pathology reducers
    builder
      .addCase(fetchPathologyById.pending, (state) => {
        state.fetchPathologyStatus = "loading";
        state.fetchPathologyError = null;
        state.currentPathology = null;
      })
      .addCase(fetchPathologyById.fulfilled, (state, action) => {
        state.fetchPathologyStatus = "succeeded";
        state.currentPathology = action.payload || null;
      })
      .addCase(fetchPathologyById.rejected, (state, action) => {
        state.fetchPathologyStatus = "failed";
        state.fetchPathologyError = action.payload || action.error.message;
      });

    // lab technicians reducers
    builder
      .addCase(fetchLabTechnicians.pending, (state) => {
        state.labTechniciansStatus = "loading";
        state.labTechniciansError = null;
      })
      .addCase(fetchLabTechnicians.fulfilled, (state, action) => {
        state.labTechniciansStatus = "succeeded";
        state.labTechnicians = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchLabTechnicians.rejected, (state, action) => {
        state.labTechniciansStatus = "failed";
        state.labTechniciansError = action.payload || action.error.message;
      });

    // update pathology status reducers
    builder
      .addCase(updatePathologyStatus.pending, (state) => {
        state.statusUpdateStatus = "loading";
        state.statusUpdateError = null;
      })
      .addCase(updatePathologyStatus.fulfilled, (state, action) => {
        state.statusUpdateStatus = "succeeded";
        const { reportId, status } = action.payload;
        // update status in cached pathologies array
        if (Array.isArray(state.pathologies)) {
          const idx = state.pathologies.findIndex(
            (p) => String(p.id || p._id) === String(reportId)
          );
          if (idx !== -1) {
            state.pathologies[idx].status = status;
          }
        }
      })
      .addCase(updatePathologyStatus.rejected, (state, action) => {
        state.statusUpdateStatus = "failed";
        state.statusUpdateError = action.payload || action.error.message;
      });

    // delete pathology reducers
    builder
      .addCase(deletePathology.pending, (state) => {
        state.statusUpdateStatus = "loading";
        state.statusUpdateError = null;
      })
      .addCase(deletePathology.fulfilled, (state, action) => {
        state.statusUpdateStatus = "succeeded";
        const { reportId } = action.payload || {};
        if (Array.isArray(state.pathologies) && reportId) {
          state.pathologies = state.pathologies.filter(
            (p) => String(p.id || p._id) !== String(reportId)
          );
        }
      })
      .addCase(deletePathology.rejected, (state, action) => {
        state.statusUpdateStatus = "failed";
        state.statusUpdateError = action.payload || action.error.message;
      });
  },
});

export const { resetCreateState, removePathologyFromCache } =
  pathologySlice.actions;

export default pathologySlice.reducer;

// Selectors
export const selectCreatePathologyStatus = (state) =>
  state.pathology?.createStatus;
export const selectCreatePathologyError = (state) =>
  state.pathology?.createError;
export const selectLastCreatedPathology = (state) =>
  state.pathology?.lastCreated;

export const selectCurrentPathology = (state) =>
  state.pathology?.currentPathology || null;
export const selectFetchPathologyStatus = (state) =>
  state.pathology?.fetchPathologyStatus || "idle";
export const selectFetchPathologyError = (state) =>
  state.pathology?.fetchPathologyError || null;

// selectors for fetched pathologies
export const selectPathologies = (state) => state.pathology?.pathologies || [];
export const selectPathologiesStatus = (state) =>
  state.pathology?.pathologiesStatus || "idle";
export const selectPathologiesError = (state) =>
  state.pathology?.pathologiesError || null;

// selectors for lab technicians
export const selectLabTechnicians = (state) =>
  state.pathology?.labTechnicians || [];
export const selectLabTechniciansStatus = (state) =>
  state.pathology?.labTechniciansStatus || "idle";
export const selectLabTechniciansError = (state) =>
  state.pathology?.labTechniciansError || null;

// selectors for update
export const selectUpdatePathologyStatus = (state) =>
  state.pathology?.updateStatus || "idle";
export const selectUpdatePathologyError = (state) =>
  state.pathology?.updateError || null;
export const selectLastUpdatedPathology = (state) =>
  state.pathology?.lastUpdated || null;

// selectors for status update
export const selectStatusUpdateStatus = (state) =>
  state.pathology?.statusUpdateStatus || "idle";
export const selectStatusUpdateError = (state) =>
  state.pathology?.statusUpdateError || null;

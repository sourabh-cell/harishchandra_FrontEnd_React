import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({ baseURL: API_BASE_URL });

// Fetch options needed for the Add Ambulance form (types, statuses, etc.)
export const fetchAmbulanceFormData = createAsyncThunk(
  "ambulance/fetchFormData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/ambulance/form-data");
      //   console.log("Fetched ambulance form data:", res.data);
      return res.data;
    } catch (err) {
      const payload = err.response
        ? {
            message:
              err.response.data?.message || err.response.data || err.message,
            status: err.response.status,
            url: err.config?.url,
          }
        : { message: err.message || "Network error", code: err.code };
      return rejectWithValue(payload);
    }
  }
);

// Optional: fetch ambulance list
export const fetchAmbulances = createAsyncThunk(
  "ambulance/fetchAmbulances",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/ambulance/list");
      return res.data;
    } catch (err) {
      const payload = err.response
        ? {
            message:
              err.response.data?.message || err.response.data || err.message,
            status: err.response.status,
            url: err.config?.url,
          }
        : { message: err.message || "Network error", code: err.code };
      return rejectWithValue(payload);
    }
  }
);

// Fetch drivers list (top-level)
export const fetchDrivers = createAsyncThunk(
  "ambulance/fetchDrivers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/ambulance/drivers");
      return res.data;
    } catch (err) {
      const payload = err.response
        ? {
            message:
              err.response.data?.message || err.response.data || err.message,
            status: err.response.status,
            url: err.config?.url,
          }
        : { message: err.message || "Network error", code: err.code };
      return rejectWithValue(payload);
    }
  }
);

// Fetch ambulance assignments list
export const fetchAssignments = createAsyncThunk(
  "ambulance/fetchAssignments",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/ambulance/assignments");
      return res.data;
    } catch (err) {
      const payload = err.response
        ? {
            message:
              err.response.data?.message || err.response.data || err.message,
            status: err.response.status,
            url: err.config?.url,
          }
        : { message: err.message || "Network error", code: err.code };
      return rejectWithValue(payload);
    }
  }
);

// Fetch completed/ historical ambulance assignments
export const fetchAssignmentHistory = createAsyncThunk(
  "ambulance/fetchAssignmentHistory",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/ambulance/assignments/history");
      return res.data;
    } catch (err) {
      const payload = err.response
        ? {
            message:
              err.response.data?.message || err.response.data || err.message,
            status: err.response.status,
            url: err.config?.url,
          }
        : { message: err.message || "Network error", code: err.code };
      return rejectWithValue(payload);
    }
  }
);

// Add a new ambulance
export const addAmbulance = createAsyncThunk(
  "ambulance/addAmbulance",
  async (ambulanceData, { rejectWithValue }) => {
    try {
      // Sanitize & normalize payload before sending
      const formatDate = (d) => {
        if (!d) return d;
        // Accept already-ISO dates; otherwise attempt conversion
        if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d; // keep YYYY-MM-DD
        const dt = new Date(d);
        return isNaN(dt.getTime()) ? d : dt.toISOString().split("T")[0];
      };
      const sanitized = {
        vehicleNumber: ambulanceData.vehicleNumber?.trim(),
        ambulanceType: ambulanceData.ambulanceType?.trim()?.toUpperCase(),
        ambulanceStatus: ambulanceData.ambulanceStatus?.trim()?.toUpperCase(),
        lastMaintenanceDate: formatDate(ambulanceData.lastMaintenanceDate),
      };
      console.debug("[addAmbulance] Sending payload", sanitized);
      const res = await api.post("/ambulance/add", sanitized, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    } catch (err) {
      console.error(
        "[addAmbulance] Error response",
        err.response?.data || err.message
      );
      const payload = err.response
        ? {
            message:
              err.response.data?.message || err.response.data || err.message,
            status: err.response.status,
            url: err.config?.url,
          }
        : { message: err.message || "Network error", code: err.code };
      return rejectWithValue(payload);
    }
  }
);

// Add a new driver (uses same API base)
export const addDriver = createAsyncThunk(
  "ambulance/addDriver",
  async (driverData, { rejectWithValue }) => {
    try {
      const sanitized = {
        driverName: driverData.driverName?.trim(),
        licenseNumber: driverData.licenseNumber?.trim(),
        contactNumber: driverData.contactNumber?.trim(),
      };

      // attach ambulance only when we have a valid numeric id
      const rawAmbId =
        driverData.ambulanceId !== undefined && driverData.ambulanceId !== null
          ? Number(driverData.ambulanceId)
          : undefined;
      if (Number.isFinite(rawAmbId)) {
        // include both top-level ambulanceId and nested ambulance object
        sanitized.ambulanceId = rawAmbId;
        sanitized.ambulance = { id: rawAmbId };
      } else if (
        driverData.ambulance &&
        Number.isFinite(Number(driverData.ambulance.id))
      ) {
        const fallbackId = Number(driverData.ambulance.id);
        sanitized.ambulanceId = fallbackId;
        sanitized.ambulance = { id: fallbackId };
      }
      console.debug("[addDriver] payload", sanitized);
      const res = await api.post("/driver/add", sanitized, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    } catch (err) {
      console.error("[addDriver] Error", err.response?.data || err.message);
      if (err.response) {
        const respData = err.response.data;
        const errors = Array.isArray(respData)
          ? respData
          : respData?.errors || respData?.fieldErrors || undefined;
        const message =
          typeof respData === "string"
            ? respData
            : respData?.message || respData || err.message;
        const payload = {
          message,
          status: err.response.status,
          url: err.config?.url,
          errors,
        };
        return rejectWithValue(payload);
      }
      return rejectWithValue({
        message: err.message || "Network error",
        code: err.code,
      });
    }
  }
);

// Add an ambulance assignment
export const addAssignment = createAsyncThunk(
  "ambulance/addAssignment",
  async (assignmentData, { rejectWithValue }) => {
    try {
      // normalize payload as needed by backend
      const payload = {
        ambulanceId: assignmentData.ambulanceId,
        driverId: assignmentData.driverId,
        status: assignmentData.status,
        fromLocation: assignmentData.fromLocation,
        toLocation: assignmentData.toLocation,
        startTime: assignmentData.startTime,
        endTime: assignmentData.endTime,
      };
      const res = await api.post("/ambulance/assignment/add", payload, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    } catch (err) {
      const payload = err.response
        ? {
            message:
              err.response.data?.message || err.response.data || err.message,
            status: err.response.status,
            url: err.config?.url,
          }
        : { message: err.message || "Network error", code: err.code };
      return rejectWithValue(payload);
    }
  }
);

// Update an existing ambulance assignment (partial updates allowed)
export const updateAssignment = createAsyncThunk(
  "ambulance/updateAssignment",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      // Backend expects status as a request parameter (?status=...)
      const q = `?status=${encodeURIComponent(updates.status)}`;
      const res = await api.put(`/ambulance/assignment/status/${id}${q}`);
      return res.data;
    } catch (err) {
      const payload = err.response
        ? {
            message:
              err.response.data?.message || err.response.data || err.message,
            status: err.response.status,
            url: err.config?.url,
          }
        : { message: err.message || "Network error", code: err.code };
      return rejectWithValue(payload);
    }
  }
);

const initialState = {
  ambulances: [],
  ambulancesStatus: "idle",
  ambulancesError: null,
  drivers: [],
  driversStatus: "idle",
  driversError: null,
  assignments: [],
  assignmentsStatus: "idle",
  assignmentsError: null,
  formDataOptions: {
    types: [],
    statuses: [],
  },
  formDataStatus: "idle",
  formDataError: null,
  addStatus: "idle",
  addError: null,
  addDriverStatus: "idle",
  addDriverError: null,
  addAssignmentStatus: "idle",
  addAssignmentError: null,
  updateAssignmentStatus: "idle",
  updateAssignmentError: null,
  assignmentHistory: [],
  assignmentHistoryStatus: "idle",
  assignmentHistoryError: null,
};

const ambulanceSlice = createSlice({
  name: "ambulance",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAmbulances.pending, (state) => {
        state.ambulancesStatus = "loading";
        state.ambulancesError = null;
      })
      .addCase(fetchAmbulances.fulfilled, (state, action) => {
        state.ambulancesStatus = "succeeded";
        if (action.payload && action.payload.data) {
          state.ambulances = Array.isArray(action.payload.data)
            ? action.payload.data
            : [action.payload.data];
        } else if (Array.isArray(action.payload)) {
          state.ambulances = action.payload;
        } else if (action.payload) {
          state.ambulances = [action.payload];
        } else {
          state.ambulances = [];
        }
      })
      .addCase(fetchAmbulances.rejected, (state, action) => {
        state.ambulancesStatus = "failed";
        state.ambulancesError = action.payload || action.error.message;
      })

      // form data
      .addCase(fetchAmbulanceFormData.pending, (state) => {
        state.formDataStatus = "loading";
        state.formDataError = null;
      })
      .addCase(fetchAmbulanceFormData.fulfilled, (state, action) => {
        state.formDataStatus = "succeeded";
        // normalize response that may be { message, data: { types: [], statuses: [] } }
        const payload = action.payload;
        const data = payload && payload.data ? payload.data : payload;
        if (data) {
          state.formDataOptions.types = data.types || data.ambulanceTypes || [];
          state.formDataOptions.statuses =
            data.statuses || data.ambulanceStatuses || [];
        } else {
          state.formDataOptions = { types: [], statuses: [] };
        }
      })
      .addCase(fetchAmbulanceFormData.rejected, (state, action) => {
        state.formDataStatus = "failed";
        state.formDataError = action.payload || action.error.message;
      });

    // add ambulance
    builder
      .addCase(addAmbulance.pending, (state) => {
        state.addStatus = "loading";
        state.addError = null;
      })
      .addCase(addAmbulance.fulfilled, (state, action) => {
        state.addStatus = "succeeded";
        const created =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        if (created) {
          if (Array.isArray(created))
            state.ambulances = [...created, ...state.ambulances];
          else state.ambulances.unshift(created);
        }
      })
      .addCase(addAmbulance.rejected, (state, action) => {
        state.addStatus = "failed";
        state.addError = action.payload || action.error.message;
      });

    // add driver
    builder
      .addCase(addDriver.pending, (state) => {
        state.addDriverStatus = "loading";
        state.addDriverError = null;
      })
      .addCase(addDriver.fulfilled, (state) => {
        state.addDriverStatus = "succeeded";
      })
      .addCase(addDriver.rejected, (state, action) => {
        state.addDriverStatus = "failed";
        state.addDriverError = action.payload || action.error.message;
      });

    // fetch drivers
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.driversStatus = "loading";
        state.driversError = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.driversStatus = "succeeded";
        if (action.payload && action.payload.data) {
          state.drivers = Array.isArray(action.payload.data)
            ? action.payload.data
            : [action.payload.data];
        } else if (Array.isArray(action.payload)) {
          state.drivers = action.payload;
        } else if (action.payload) {
          state.drivers = [action.payload];
        } else {
          state.drivers = [];
        }
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.driversStatus = "failed";
        state.driversError = action.payload || action.error.message;
      });

    // fetch assignments
    builder
      .addCase(fetchAssignments.pending, (state) => {
        state.assignmentsStatus = "loading";
        state.assignmentsError = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.assignmentsStatus = "succeeded";
        if (action.payload && action.payload.data) {
          state.assignments = Array.isArray(action.payload.data)
            ? action.payload.data
            : [action.payload.data];
        } else if (Array.isArray(action.payload)) {
          state.assignments = action.payload;
        } else if (action.payload) {
          state.assignments = [action.payload];
        } else {
          state.assignments = [];
        }
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.assignmentsStatus = "failed";
        state.assignmentsError = action.payload || action.error.message;
      });

    // add assignment
    builder
      .addCase(addAssignment.pending, (state) => {
        state.addAssignmentStatus = "loading";
        state.addAssignmentError = null;
      })
      .addCase(addAssignment.fulfilled, (state) => {
        state.addAssignmentStatus = "succeeded";
        // backend may return created assignment under payload or payload.data
        // no local list maintained here, just keep status for callers
      })
      .addCase(addAssignment.rejected, (state, action) => {
        state.addAssignmentStatus = "failed";
        state.addAssignmentError = action.payload || action.error.message;
      });

    // update assignment
    builder
      .addCase(updateAssignment.pending, (state) => {
        state.updateAssignmentStatus = "loading";
        state.updateAssignmentError = null;
      })
      .addCase(updateAssignment.fulfilled, (state, action) => {
        state.updateAssignmentStatus = "succeeded";
        const payload =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        if (payload) {
          // payload may be a single assignment or array
          const updated = Array.isArray(payload) ? payload : [payload];
          updated.forEach((u) => {
            const idx = state.assignments.findIndex(
              (a) => Number(a.id) === Number(u.id)
            );
            if (idx !== -1)
              state.assignments[idx] = { ...state.assignments[idx], ...u };
            else state.assignments.unshift(u);
          });
        }
      })
      .addCase(updateAssignment.rejected, (state, action) => {
        state.updateAssignmentStatus = "failed";
        state.updateAssignmentError = action.payload || action.error.message;
      });

    // fetch assignment history
    builder
      .addCase(fetchAssignmentHistory.pending, (state) => {
        state.assignmentHistoryStatus = "loading";
        state.assignmentHistoryError = null;
      })
      .addCase(fetchAssignmentHistory.fulfilled, (state, action) => {
        state.assignmentHistoryStatus = "succeeded";
        if (action.payload && action.payload.data) {
          state.assignmentHistory = Array.isArray(action.payload.data)
            ? action.payload.data
            : [action.payload.data];
        } else if (Array.isArray(action.payload)) {
          state.assignmentHistory = action.payload;
        } else if (action.payload) {
          state.assignmentHistory = [action.payload];
        } else {
          state.assignmentHistory = [];
        }
      })
      .addCase(fetchAssignmentHistory.rejected, (state, action) => {
        state.assignmentHistoryStatus = "failed";
        state.assignmentHistoryError = action.payload || action.error.message;
      });
  },
});

export default ambulanceSlice.reducer;

// Selectors
export const selectAmbulances = (state) => state.ambulance?.ambulances;
export const selectAmbulancesStatus = (state) =>
  state.ambulance?.ambulancesStatus;
export const selectAmbulancesError = (state) =>
  state.ambulance?.ambulancesError;
export const selectDrivers = (state) => state.ambulance?.drivers;
export const selectDriversStatus = (state) => state.ambulance?.driversStatus;
export const selectDriversError = (state) => state.ambulance?.driversError;
export const selectAssignments = (state) => state.ambulance?.assignments;
export const selectAssignmentsStatus = (state) =>
  state.ambulance?.assignmentsStatus;
export const selectAssignmentsError = (state) =>
  state.ambulance?.assignmentsError;
export const selectAssignmentHistory = (state) =>
  state.ambulance?.assignmentHistory;
export const selectAssignmentHistoryStatus = (state) =>
  state.ambulance?.assignmentHistoryStatus;
export const selectAssignmentHistoryError = (state) =>
  state.ambulance?.assignmentHistoryError;
export const selectAmbulanceFormData = (state) =>
  state.ambulance?.formDataOptions;
export const selectAmbulanceFormDataStatus = (state) =>
  state.ambulance?.formDataStatus;
export const selectAmbulanceFormDataError = (state) =>
  state.ambulance?.formDataError;
export const selectAddAmbulanceStatus = (state) => state.ambulance?.addStatus;
export const selectAddAmbulanceError = (state) => state.ambulance?.addError;
export const selectAddDriverStatus = (state) =>
  state.ambulance?.addDriverStatus;
export const selectAddDriverError = (state) => state.ambulance?.addDriverError;
export const selectAddAssignmentStatus = (state) =>
  state.ambulance?.addAssignmentStatus;
export const selectAddAssignmentError = (state) =>
  state.ambulance?.addAssignmentError;

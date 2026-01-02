import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({ baseURL: API_BASE_URL });

// Fetch all doctor schedules
export const fetchSchedules = createAsyncThunk(
  "doctorSchedule/fetchSchedules",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/doctor-schedule");
      //   console.log("Fetched schedules:", res.data);
      return res.data;
    } catch (err) {
      const message = err.response?.data || err.message || "Network error";
      return rejectWithValue(message);
    }
  }
);

// Fetch all departments for doctor schedule
export const fetchDepartments = createAsyncThunk(
  "doctorSchedule/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/doctor-schedule/departments");
      return res.data;
    } catch (err) {
      const message = err.response?.data || err.message || "Network error";
      return rejectWithValue(message);
    }
  }
);

// Create a new schedule
export const createSchedule = createAsyncThunk(
  "doctorSchedule/createSchedule",
  async (scheduleData, { rejectWithValue }) => {
    try {
      const res = await api.post("/doctor-schedule", scheduleData, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    } catch (err) {
      const message = err.response?.data || err.message || "Network error";
      return rejectWithValue(message);
    }
  }
);

// Update schedule by id
export const updateSchedule = createAsyncThunk(
  "doctorSchedule/updateSchedule",
  async ({ id, scheduleData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/doctor-schedule/${id}`, scheduleData, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    } catch (err) {
      const message = err.response?.data || err.message || "Network error";
      return rejectWithValue(message);
    }
  }
);

// Delete schedule by id
export const deleteSchedule = createAsyncThunk(
  "doctorSchedule/deleteSchedule",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/doctor-schedule/${id}`);
      return { id, data: res.data };
    } catch (err) {
      const message = err.response?.data || err.message || "Network error";
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  schedules: [],
  status: "idle",
  error: null,
  departments: [],
  departmentsStatus: "idle",
  departmentsError: null,
  createStatus: "idle",
  createError: null,
  updateStatus: "idle",
  updateError: null,
  deleteStatus: "idle",
  deleteError: null,
};

const doctorScheduleSlice = createSlice({
  name: "doctorSchedule",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchSchedules.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.status = "succeeded";
        // API may return { message, data: [...] } or an array directly
        if (action.payload && action.payload.data) {
          state.schedules = Array.isArray(action.payload.data)
            ? action.payload.data
            : [action.payload.data];
        } else if (Array.isArray(action.payload)) {
          state.schedules = action.payload;
        } else if (action.payload) {
          state.schedules = [action.payload];
        } else {
          state.schedules = [];
        }
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // create
      .addCase(createSchedule.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        // created item might be in action.payload or action.payload.data
        const created =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        if (created) {
          // if API returns wrapper with data array, handle accordingly
          if (Array.isArray(created))
            state.schedules = [...created, ...state.schedules];
          else state.schedules.unshift(created);
        }
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload || action.error.message;
      })

      // update
      .addCase(updateSchedule.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const updated = action.payload;
        if (updated && (updated.id || updated._id)) {
          const idKey = updated.id ?? updated._id;
          const idx = state.schedules.findIndex(
            (s) =>
              String(s.id) === String(idKey) || String(s._id) === String(idKey)
          );
          if (idx !== -1) state.schedules[idx] = updated;
        }
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload || action.error.message;
      })

      // delete
      .addCase(deleteSchedule.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        const id = action.payload?.id;
        if (id !== undefined) {
          state.schedules = state.schedules.filter(
            (s) => String(s.id || s._id) !== String(id)
          );
        }
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.payload || action.error.message;
      });

    // departments
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.departmentsStatus = "loading";
        state.departmentsError = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departmentsStatus = "succeeded";
        if (action.payload && action.payload.data) {
          state.departments = Array.isArray(action.payload.data)
            ? action.payload.data
            : [action.payload.data];
        } else if (Array.isArray(action.payload)) {
          state.departments = action.payload;
        } else if (action.payload) {
          state.departments = [action.payload];
        } else {
          state.departments = [];
        }
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.departmentsStatus = "failed";
        state.departmentsError = action.payload || action.error.message;
      });
  },
});

export default doctorScheduleSlice.reducer;

// Selectors
export const selectSchedules = (state) => state.doctorSchedule?.schedules;
export const selectSchedulesStatus = (state) => state.doctorSchedule?.status;
export const selectSchedulesError = (state) => state.doctorSchedule?.error;
export const selectCreateStatus = (state) => state.doctorSchedule?.createStatus;
export const selectUpdateStatus = (state) => state.doctorSchedule?.updateStatus;
export const selectDeleteStatus = (state) => state.doctorSchedule?.deleteStatus;
export const selectDepartments = (state) => state.doctorSchedule?.departments;
export const selectDepartmentsStatus = (state) =>
  state.doctorSchedule?.departmentsStatus;
export const selectDepartmentsError = (state) =>
  state.doctorSchedule?.departmentsError;

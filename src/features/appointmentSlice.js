import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create appointment thunk
export const createAppointment = createAsyncThunk(
  "appointment/create",
  async (payload, { rejectWithValue }) => {
    try {
      // Ensure we send both camelCase and snake_case id fields to satisfy different backends
      const body = {
        ...payload,
        patient_id: payload.patientId ?? payload.patient_id ?? null,
        doctor_id: payload.doctorId ?? payload.doctor_id ?? null,
        department_id: payload.departmentId ?? payload.department_id ?? null,
      };
      const res = await axios.post(`${API_BASE_URL}/appointment`, body);
      console.log("Appointment created:", res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Update appointment thunk
export const updateAppointment = createAsyncThunk(
  "appointment/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const body = {
        ...data,
        patient_id: data.patientId ?? data.patient_id ?? null,
        doctor_id: data.doctorId ?? data.doctor_id ?? null,
        department_id: data.departmentId ?? data.department_id ?? null,
      };
      const res = await axios.put(`${API_BASE_URL}/appointment/${id}`, body);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Fetch all appointments
export const fetchAppointments = createAsyncThunk(
  "appointment/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/appointment`);
      // assume API returns array or wrapped {data: []}
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Update appointment status
export const updateAppointmentStatus = createAsyncThunk(
  "appointment/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/appointment/status/${id}/${status}`
      );
      return { id, status, response: res.data };
    } catch (err) {
      const payload = err?.response?.data;
      let message;
      if (payload) {
        if (typeof payload === "string") message = payload;
        else if (payload.message) message = payload.message;
        else if (payload.error) message = payload.error;
        else {
          try {
            message = JSON.stringify(payload);
          } catch {
            message = String(payload);
          }
        }
      } else {
        message = err?.message || "Failed to update appointment status";
      }
      return rejectWithValue(message);
    }
  }
);

const appointmentSlice = createSlice({
  name: "appointment",
  initialState: {
    createStatus: "idle",
    createError: null,
    lastCreated: null,
    updateStatus: "idle",
    updateError: null,
    lastUpdated: null,
    list: [],
    listStatus: "idle",
    listError: null,
  },
  reducers: {
    clearAppointmentState(state) {
      state.createStatus = "idle";
      state.createError = null;
      state.lastCreated = null;
      state.updateStatus = "idle";
      state.updateError = null;
      state.lastUpdated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAppointment.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.lastCreated = action.payload;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload || action.error.message;
      })
      // fetchAppointments lifecycle
      .addCase(fetchAppointments.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload || action.error.message;
      })
      // updateAppointmentStatus lifecycle
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload || {};
        // Optimistically update status in list if item exists
        const idx = state.list.findIndex(
          (it) =>
            String(it?.id ?? it?.appointmentId ?? it?.appointment_id) ===
            String(id)
        );
        if (idx !== -1) {
          const updated = { ...state.list[idx] };
          updated.status = status;
          updated.appointmentStatus = status;
          state.list[idx] = updated;
        }
      })
      .addCase(updateAppointmentStatus.rejected, () => {
        // no state change; UI may show error
      });

    // updateAppointment lifecycle
    builder
      .addCase(updateAppointment.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.lastUpdated = action.payload;

        const updated = action.payload || {};
        const id =
          updated.id ?? updated.appointmentId ?? updated.appointment_id;
        const idx = state.list.findIndex(
          (it) =>
            String(it?.id ?? it?.appointmentId ?? it?.appointment_id) ===
            String(id)
        );
        if (idx !== -1) {
          state.list[idx] = { ...state.list[idx], ...updated };
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload || action.error.message;
      });
  },
});

export const { clearAppointmentState } = appointmentSlice.actions;

export const selectCreateStatus = (state) =>
  state.appointment?.createStatus || "idle";
export const selectCreateError = (state) =>
  state.appointment?.createError || null;
export const selectLastCreated = (state) =>
  state.appointment?.lastCreated || null;
export const selectUpdateStatus = (state) =>
  state.appointment?.updateStatus || "idle";
export const selectUpdateError = (state) =>
  state.appointment?.updateError || null;
export const selectLastUpdated = (state) =>
  state.appointment?.lastUpdated || null;
export const selectAppointments = (state) => state.appointment?.list || [];
export const selectAppointmentsStatus = (state) =>
  state.appointment?.listStatus || "idle";
export const selectAppointmentsError = (state) =>
  state.appointment?.listError || null;

export default appointmentSlice.reducer;

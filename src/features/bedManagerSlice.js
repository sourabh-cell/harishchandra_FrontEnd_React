import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getToken } from "../utils/authToken";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({ baseURL: API_BASE_URL });

// Attach JWT from local storage to every request if available
api.interceptors.request.use(
  (config) => {
    try {
      const token = getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore token errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a new room
export const addRoom = createAsyncThunk(
  "bedManager/addRoom",
  async (roomData, { rejectWithValue }) => {
    try {
      // Payload expected by backend
      const payload = {
        roomNo: roomData.roomNo?.toString(),
        floor: Number(roomData.floor),
        status: roomData.status,
        roomName: roomData.roomName?.trim(),
        roomTypeName: roomData.roomTypeName || roomData.roomType || "",
        description: roomData.description?.trim(),
        pricePerDay: Number(roomData.pricePerDay),
      };
      const res = await api.post("/room/add", payload, {
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

// Optional: fetch rooms
export const fetchRooms = createAsyncThunk(
  "bedManager/fetchRooms",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/room/list");
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

// Fetch form-data needed for beds UI (rooms list + bed status options)
export const fetchBedsFormData = createAsyncThunk(
  "bedManager/fetchBedsFormData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/beds/form-data");
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

// Fetch beds list for the BedList view
export const fetchBedsList = createAsyncThunk(
  "bedManager/fetchBedsList",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/rooms");
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

// Fetch assign metadata for a room (bed numbers + patient ids + room info)
export const fetchAssignData = createAsyncThunk(
  "bedManager/fetchAssignData",
  async (roomId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/assign/${roomId}`);
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

// Assign a bed to a patient in a room
export const assignBed = createAsyncThunk(
  "bedManager/assignBed",
  async ({ roomId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/assign/${roomId}`, payload, {
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

// New: Create assignment via POST /assign (body contains roomId, bedId, patientHospitalId, patientId, assignedAt)
export const postAssign = createAsyncThunk(
  "bedManager/postAssign",
  async (payloadBody, { rejectWithValue }) => {
    try {
      // include JWT explicitly from local storage for this request
      const token = getToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await api.post(`/assign`, payloadBody, { headers });
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

// Add a new bed
export const addBed = createAsyncThunk(
  "bedManager/addBed",
  async (bedData, { rejectWithValue }) => {
    try {
      const payload = {
        bedNumber: bedData.bedNumber?.toString(),
        roomId: bedData.roomId,
        status: bedData.status,
      };
      const res = await api.post("/beds/add", payload, {
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

const initialState = {
  rooms: [],
  roomsStatus: "idle",
  roomsError: null,
  bedsFormData: { rooms: [], bedStatus: [] },
  bedsFormDataStatus: "idle",
  bedsFormDataError: null,
  addBedStatus: "idle",
  addBedError: null,
  addRoomStatus: "idle",
  addRoomError: null,
  bedsList: [],
  bedsListStatus: "idle",
  bedsListError: null,
  assignData: { bedNumbers: {}, patientIds: {}, room: null },
  assignDataStatus: "idle",
  assignDataError: null,
  assignBedStatus: "idle",
  assignBedError: null,
};

const bedManagerSlice = createSlice({
  name: "bedManager",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.roomsStatus = "loading";
        state.roomsError = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.roomsStatus = "succeeded";
        if (action.payload && action.payload.data) {
          state.rooms = Array.isArray(action.payload.data)
            ? action.payload.data
            : [action.payload.data];
        } else if (Array.isArray(action.payload)) {
          state.rooms = action.payload;
        } else if (action.payload) {
          state.rooms = [action.payload];
        } else {
          state.rooms = [];
        }
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.roomsStatus = "failed";
        state.roomsError = action.payload || action.error.message;
      })

      // add room
      .addCase(addRoom.pending, (state) => {
        state.addRoomStatus = "loading";
        state.addRoomError = null;
      })
      .addCase(addRoom.fulfilled, (state, action) => {
        state.addRoomStatus = "succeeded";
        const created =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        if (created) {
          if (Array.isArray(created))
            state.rooms = [...created, ...state.rooms];
          else state.rooms.unshift(created);
        }
      })
      .addCase(addRoom.rejected, (state, action) => {
        state.addRoomStatus = "failed";
        state.addRoomError = action.payload || action.error.message;
      });

    // beds form-data
    builder
      .addCase(fetchBedsFormData.pending, (state) => {
        state.bedsFormDataStatus = "loading";
        state.bedsFormDataError = null;
      })
      .addCase(fetchBedsFormData.fulfilled, (state, action) => {
        state.bedsFormDataStatus = "succeeded";
        const payload =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        if (payload) {
          state.bedsFormData.rooms = payload.rooms || payload.roomList || [];
          state.bedsFormData.bedStatus =
            payload.bedStatus || payload.bedStatuses || [];
        } else {
          state.bedsFormData = { rooms: [], bedStatus: [] };
        }
      })
      .addCase(fetchBedsFormData.rejected, (state, action) => {
        state.bedsFormDataStatus = "failed";
        state.bedsFormDataError = action.payload || action.error.message;
      });

    // beds list
    builder
      .addCase(fetchBedsList.pending, (state) => {
        state.bedsListStatus = "loading";
        state.bedsListError = null;
      })
      .addCase(fetchBedsList.fulfilled, (state, action) => {
        state.bedsListStatus = "succeeded";
        const payload =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        if (Array.isArray(payload)) {
          state.bedsList = payload;
        } else if (payload && Array.isArray(payload.rooms)) {
          state.bedsList = payload.rooms;
        } else if (payload) {
          state.bedsList = [payload];
        } else {
          state.bedsList = [];
        }
      })
      .addCase(fetchBedsList.rejected, (state, action) => {
        state.bedsListStatus = "failed";
        state.bedsListError = action.payload || action.error.message;
      });

    // assign metadata
    builder
      .addCase(fetchAssignData.pending, (state) => {
        state.assignDataStatus = "loading";
        state.assignDataError = null;
      })
      .addCase(fetchAssignData.fulfilled, (state, action) => {
        state.assignDataStatus = "succeeded";
        const payload =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        if (payload) {
          state.assignData = {
            bedNumbers: payload.bedNumbers || payload.bed_nums || {},
            patientIds: payload.patientIds || payload.patient_ids || {},
            room: payload.room || payload.roomInfo || null,
          };
        } else {
          state.assignData = { bedNumbers: {}, patientIds: {}, room: null };
        }
      })
      .addCase(fetchAssignData.rejected, (state, action) => {
        state.assignDataStatus = "failed";
        state.assignDataError = action.payload || action.error.message;
      });

    // assign bed
    builder
      .addCase(assignBed.pending, (state) => {
        state.assignBedStatus = "loading";
        state.assignBedError = null;
      })
      .addCase(assignBed.fulfilled, (state) => {
        state.assignBedStatus = "succeeded";
        // backend response may contain message or updated room; not stored here
      })
      .addCase(assignBed.rejected, (state, action) => {
        state.assignBedStatus = "failed";
        state.assignBedError = action.payload || action.error.message;
      });

    // post assign (new)
    builder
      .addCase(postAssign.pending, (state) => {
        state.assignBedStatus = "loading";
        state.assignBedError = null;
      })
      .addCase(postAssign.fulfilled, (state) => {
        state.assignBedStatus = "succeeded";
      })
      .addCase(postAssign.rejected, (state, action) => {
        state.assignBedStatus = "failed";
        state.assignBedError = action.payload || action.error.message;
      });

    // add bed
    builder
      .addCase(addBed.pending, (state) => {
        state.addBedStatus = "loading";
        state.addBedError = null;
      })
      .addCase(addBed.fulfilled, (state) => {
        state.addBedStatus = "succeeded";
      })
      .addCase(addBed.rejected, (state, action) => {
        state.addBedStatus = "failed";
        state.addBedError = action.payload || action.error.message;
      });
  },
});

export default bedManagerSlice.reducer;

// Selectors
export const selectRooms = (state) => state.bedManager?.rooms;
export const selectRoomsStatus = (state) => state.bedManager?.roomsStatus;
export const selectRoomsError = (state) => state.bedManager?.roomsError;
export const selectAddRoomStatus = (state) => state.bedManager?.addRoomStatus;
export const selectAddRoomError = (state) => state.bedManager?.addRoomError;
export const selectBedsFormData = (state) => state.bedManager?.bedsFormData;
export const selectBedsFormDataStatus = (state) =>
  state.bedManager?.bedsFormDataStatus;
export const selectBedsFormDataError = (state) =>
  state.bedManager?.bedsFormDataError;
export const selectAddBedStatus = (state) => state.bedManager?.addBedStatus;
export const selectAddBedError = (state) => state.bedManager?.addBedError;
export const selectBedsList = (state) => state.bedManager?.bedsList;
export const selectBedsListStatus = (state) => state.bedManager?.bedsListStatus;
export const selectBedsListError = (state) => state.bedManager?.bedsListError;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Thunks
export const fetchNotices = createAsyncThunk(
  "notice/fetchNotices",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notices`);
      // support both { data: [...] } and [...] responses
      return res.data?.data ?? res.data;
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Failed to load notices";
      return rejectWithValue({
        message,
        errors: err?.response?.data?.errors ?? null,
      });
    }
  }
);

export const addNotice = createAsyncThunk(
  "notice/addNotice",
  async (payload, { rejectWithValue }) => {
    try {
      // Support sending FormData (for multipart uploads) or JSON payload
      const isForm =
        typeof FormData !== "undefined" && payload instanceof FormData;
      const config = isForm
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : { headers: { "Content-Type": "application/json" } };

      const body = isForm ? payload : payload;
      const res = await axios.post(`${API_BASE_URL}/notices`, body, config);
      return res.data?.data ?? res.data;
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Failed to add notice";
      return rejectWithValue({
        message,
        errors: err?.response?.data?.errors ?? null,
      });
    }
  }
);

export const updateNotice = createAsyncThunk(
  "notice/updateNotice",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const isForm =
        typeof FormData !== "undefined" && payload instanceof FormData;
      const config = isForm
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : { headers: { "Content-Type": "application/json" } };
      const res = await axios.put(
        `${API_BASE_URL}/notices/${id}`,
        payload,
        config
      );
      return res.data?.data ?? res.data;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to update notice";
      return rejectWithValue({
        message,
        errors: err?.response?.data?.errors ?? null,
      });
    }
  }
);

export const deleteNotice = createAsyncThunk(
  "notice/deleteNotice",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/notices/${id}`);
      return id;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to delete notice";
      return rejectWithValue({ message });
    }
  }
);

const noticeSlice = createSlice({
  name: "notice",
  initialState: {
    list: [],
    fetchStatus: "idle",
    fetchError: null,
    addStatus: "idle",
    addError: null,
    updateStatus: "idle",
    updateError: null,
    deleteStatus: "idle",
    deleteError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchNotices.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(fetchNotices.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchNotices.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = action.payload?.message || action.error?.message;
      })

      // add
      .addCase(addNotice.pending, (state) => {
        state.addStatus = "loading";
        state.addError = null;
      })
      .addCase(addNotice.fulfilled, (state, action) => {
        state.addStatus = "succeeded";
        state.list.unshift(action.payload);
      })
      .addCase(addNotice.rejected, (state, action) => {
        state.addStatus = "failed";
        state.addError = action.payload?.message || action.error?.message;
      })

      // update
      .addCase(updateNotice.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateNotice.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const idx = state.list.findIndex(
          (n) => String(n.id) === String(action.payload.id)
        );
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(updateNotice.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload?.message || action.error?.message;
      })

      // delete
      .addCase(deleteNotice.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deleteNotice.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.list = state.list.filter(
          (n) => String(n.id) !== String(action.payload)
        );
      })
      .addCase(deleteNotice.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.payload?.message || action.error?.message;
      });
  },
});

export const selectNotices = (state) => state.notice?.list ?? [];
export const selectNoticesFetchStatus = (state) => state.notice?.fetchStatus;
export const selectNoticesFetchError = (state) => state.notice?.fetchError;

export default noticeSlice.reducer;

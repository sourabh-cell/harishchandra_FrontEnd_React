import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosConfig";

// GET /api/medicines
export const fetchAllMedicines = createAsyncThunk(
  "medicine/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/medicines");
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

// POST /api/medicines
export const addMedicine = createAsyncThunk(
  "medicine/addMedicine",
  async (medicine, { rejectWithValue }) => {
    console.log("addMedicine received:", medicine);
    try {
      const res = await axiosInstance.post("/medicines", medicine, {
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

// DELETE /api/medicines/delete/{medicineId}
export const deleteMedicine = createAsyncThunk(
  "medicine/deleteMedicine",
  async (medicineId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/medicines/delete/${medicineId}`);
      return medicineId;
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

// PUT /api/medicines/update/{medicineId}
export const updateMedicine = createAsyncThunk(
  "medicine/updateMedicine",
  async ({ medicineId, medicine }, { rejectWithValue }) => {
    try {
      const updateData = {
        ...medicine,
        medicineId: medicineId
      };
      const res = await axiosInstance.put(`/medicines/update/${medicineId}`, updateData, {
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

const initialState = {
  medicines: [],
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

const medicineSlice = createSlice({
  name: "medicine",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMedicines.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(fetchAllMedicines.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        const list =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        state.medicines = Array.isArray(list) ? list : list ? [list] : [];
      })
      .addCase(fetchAllMedicines.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = action.payload?.message || action.error?.message;
      })

      .addCase(addMedicine.pending, (state) => {
        state.addStatus = "loading";
        state.addError = null;
        state.addErrors = null;
      })
      .addCase(addMedicine.fulfilled, (state, action) => {
        state.addStatus = "succeeded";
        const created =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        if (created) {
          if (Array.isArray(created))
            state.medicines = [...created, ...state.medicines];
          else state.medicines.unshift(created);
        }
      })
      .addCase(addMedicine.rejected, (state, action) => {
        state.addStatus = "failed";
        state.addError = action.payload?.message || action.error?.message;
        state.addErrors = action.payload?.errors;
      })

      .addCase(deleteMedicine.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deleteMedicine.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.medicines = state.medicines.filter(
          (m) => m.medicineId !== action.payload
        );
      })
      .addCase(deleteMedicine.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.payload?.message || action.error?.message;
      })

      .addCase(updateMedicine.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
        state.updateErrors = null;
      })
      .addCase(updateMedicine.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const updated =
          action.payload && action.payload.data
            ? action.payload.data
            : action.payload;
        if (updated) {
          const index = state.medicines.findIndex(
            (m) => m.medicineId === updated.medicineId
          );
          if (index !== -1) {
            state.medicines[index] = updated;
          }
        }
      })
      .addCase(updateMedicine.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload?.message || action.error.message;
        state.updateErrors = action.payload?.errors || null;
      });
  },
});

export default medicineSlice.reducer;

// Selectors
export const selectMedicines = (state) => state.medicine?.medicines;
export const selectFetchMedicinesStatus = (state) =>
  state.medicine?.fetchStatus;
export const selectFetchMedicinesError = (state) =>
  state.medicine?.fetchError;
export const selectAddMedicineStatus = (state) => state.medicine?.addStatus;
export const selectAddMedicineError = (state) => state.medicine?.addError;
export const selectAddMedicineErrors = (state) => state.medicine?.addErrors;
export const selectDeleteMedicineStatus = (state) =>
  state.medicine?.deleteStatus;
export const selectDeleteMedicineError = (state) =>
  state.medicine?.deleteError;
export const selectUpdateMedicineStatus = (state) =>
  state.medicine?.updateStatus || "idle";
export const selectUpdateMedicineError = (state) =>
  state.medicine?.updateError;
export const selectUpdateMedicineErrors = (state) =>
  state.medicine?.updateErrors;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Async thunk for fetching admin dashboard data
export const fetchAdminDashboardData = createAsyncThunk(
  "dashboard/fetchAdminDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard-card/admin`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth") ? JSON.parse(localStorage.getItem("auth")).token : null}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch admin dashboard data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state matching the API response structure
const initialState = {
  // Statistics data from API
  statistics: {
    patientOpdCount: 0,
    patientIpdCount: 0,
    patientErCount: 0,
    todaysAppointments: 0,
    availableBeds: 0,
    totalAvailableHeadNurses: 0,
    totalActivePatients: 0,
    totalAppointments: 0,
    totalAvailableDoctors: 0,
    totalDoctors: 0,
    totalBeds: 0,
    totalStaffs: 0,
    totalHeadNurses: 0,
  },
  // Notices data (can be extended from API)
  notices: [
    {
      id: 1,
      type: "patient",
      icon: "fa-procedures",
      iconColor: "text-danger",
      title: "Patient Admission Alert",
      time: "10 min ago",
    },
    {
      id: 2,
      type: "staff",
      icon: "fa-user-nurse",
      iconColor: "text-warning",
      title: "Staff Shift Schedule Update",
      time: "30 min ago",
    },
    {
      id: 3,
      type: "pharmacy",
      icon: "fa-prescription-bottle-alt",
      iconColor: "text-info",
      title: "Pharmacy Stock Notice",
      time: "1h ago",
    },
    {
      id: 4,
      type: "hospital",
      icon: "fa-hospital",
      iconColor: "text-primary",
      title: "General Hospital Announcement",
      time: "Yesterday",
    },
  ],
  // Loading and error states
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    // Update individual statistics
    updateStatistic: (state, action) => {
      const { key, value } = action.payload;
      if (state.statistics.hasOwnProperty(key)) {
        state.statistics[key] = value;
      }
    },
    // Update all statistics at once
    updateAllStatistics: (state, action) => {
      state.statistics = { ...state.statistics, ...action.payload };
    },
    // Add a new notice
    addNotice: (state, action) => {
      state.notices.unshift(action.payload);
    },
    // Mark notice as read
    markNoticeAsRead: (state, action) => {
      const notice = state.notices.find((n) => n.id === action.payload);
      if (notice) {
        notice.read = true;
      }
    },
    // Clear all notices
    clearNotices: (state) => {
      state.notices = [];
    },
    // Reset dashboard to initial state
    resetDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        // Map API response to statistics state
        const apiData = action.payload;
        state.statistics = {
          patientOpdCount: apiData.patientOpdCount || 0,
          patientIpdCount: apiData.patientIpdCount || 0,
          patientErCount: apiData.patientErCount || 0,
          todaysAppointments: apiData.todaysAppointments || 0,
          availableBeds: apiData.availableBeds || 0,
          totalAvailableHeadNurses: apiData.totalAvailableHeadNurses || 0,
          totalActivePatients: apiData.totalActivePatients || 0,
          totalAppointments: apiData.totalAppointments || 0,
          totalAvailableDoctors: apiData.totalAvailableDoctors || 0,
          totalDoctors: apiData.totalDoctors || 0,
          totalBeds: apiData.totalBeds || 0,
          totalStaffs: apiData.totalStaffs || 0,
          totalHeadNurses: apiData.totalHeadNurses || 0,
        };
      })
      .addCase(fetchAdminDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  updateStatistic,
  updateAllStatistics,
  addNotice,
  markNoticeAsRead,
  clearNotices,
  resetDashboard,
} = dashboardSlice.actions;

// Export selectors
export const selectDashboardStatistics = (state) => state.dashboard.statistics;
export const selectDashboardNotices = (state) => state.dashboard.notices;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;

// Export reducer
export default dashboardSlice.reducer;

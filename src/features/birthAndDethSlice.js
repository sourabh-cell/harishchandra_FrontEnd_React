import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch all mothers from IPD birth-report endpoint
export const fetchMothers = createAsyncThunk(
  "birthAndDeth/fetchMothers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/birth-report/ipd/mother`);
      if (!res.ok) {
        const text = await res.text();
        console.log("fetchMothers error response text:", text);
        return rejectWithValue(text || "Failed to fetch mothers");
      }
      const data = await res.json();
      // Normalize: if response wraps list in data/content, try to extract
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.content)) return data.content;
      // If object with items property
      if (Array.isArray(data.items)) return data.items;
      // Fallback: try to find any array inside object
      const arr = Object.values(data).find((v) => Array.isArray(v));
      if (Array.isArray(arr)) return arr;
      // Otherwise return empty
      return [];
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// Fetch all birth reports from the /birth-report endpoint
export const fetchBirthReports = createAsyncThunk(
  "birthAndDeth/fetchBirthReports",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/birth-report`);
      if (!res.ok) {
        const text = await res.text();
        console.log("fetchBirthReports error response text:", text);
        return rejectWithValue(text || "Failed to fetch birth reports");
      }
      const data = await res.json();
      // Normalize: if response wraps list in data/content, try to extract
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.content)) return data.content;
      // If object with items property
      if (Array.isArray(data.items)) return data.items;
      // Fallback: try to find any array inside object
      const arr = Object.values(data).find((v) => Array.isArray(v));
      if (Array.isArray(arr)) return arr;
      // Otherwise return empty
      return [];
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

export const searchPatients = createAsyncThunk(
  "birthAndDeth/searchPatients",
  async (_, { rejectWithValue }) => {
    try {
      // Use the same normalization logic as fetchMothers but against
      // the /death-certificate/ipd-er/patient endpoint (no query param).
      const res = await fetch(`${API_BASE_URL}/death-certificate/ipd-er/patient`);
      console.log("searchPatients fetch response:", res);
      if (!res.ok) {
        const text = await res.text();
        console.log("searchPatients error response text:", text);
        return rejectWithValue(text || "Failed to search patients");
      }
      const data = await res.json();
      // Normalize: if response wraps list in data/content, try to extract
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.content)) return data.content;
      // If object with items property
      if (Array.isArray(data.items)) return data.items;
      // Fallback: try to find any array inside object
      const arr = Object.values(data).find((v) => Array.isArray(v));
      if (Array.isArray(arr)) return arr;
      // Otherwise return empty
      return [];
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

export const createBirthCertificate = createAsyncThunk(
  "birthAndDeth/createBirthCertificate",
  async (certificateData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/birth-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(certificateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData || "Failed to create certificate");
      }

      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// Update Birth Certificate
export const updateBirthCertificate = createAsyncThunk(
  "birthAndDeth/updateBirthCertificate",
  async ({ id, certificateData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/birth-report/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(certificateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return rejectWithValue(errorData || "Failed to update certificate");
      }

      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// Create Death Certificate
export const createDeathCertificate = createAsyncThunk(
  "birthAndDeth/createDeathCertificate",
  async (deathData, { rejectWithValue }) => {
    try {
      // Map incoming deathData to backend payload expected shape
      // Use patientVisitId from the form
      console.log("deathData received in thunk:", deathData);
      const payload = {
        fullName: deathData.deceasedName,
        gender: deathData.gender,
        dateOfDeath: deathData.deathDate,
        timeOfDeath: deathData.deathTime,
        ageAtDeath: Number(deathData.age) || null,
        causeOfDeath: deathData.cause,
        placeOfDeath: deathData.place,
        address: deathData.address,
        attendingDoctor: deathData.doctor,
        // include contact number and dateOfBirth when available so backend
        // can store or validate them. These are sent only if present in the form.
        contactNumber: deathData.contactNumber || null,
        dateOfBirth: deathData.birthDate || null,
        issueDate: deathData.issueDate,
        // backend expects patientVisitId (numeric Long)
        patientVisitId: deathData.patientVisitId ? Number(deathData.patientVisitId) : null,
      };

      console.log("Payload being sent:", payload);

      // Do NOT include date of birth in the payload per requirements

      const response = await fetch(`${API_BASE_URL}/death-certificate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("createDeathCertificate response:", response);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return rejectWithValue(
          errorData || "Failed to create death certificate"
        );
      }

      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// Fetch all death certificates (or a single object) from /death-certificate
export const fetchDeathCertificates = createAsyncThunk(
  "birthAndDeth/fetchDeathCertificates",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/death-certificate`);
      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue(text || "Failed to fetch death certificates");
      }
      const data = await res.json();
      // normalize: prefer array, but if API returns single object, wrap it
      if (Array.isArray(data)) return data;
      if (data == null) return [];
      // if it's an object representing a single certificate, wrap it
      if (typeof data === "object") return [data];
      return [];
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// Fetch single death certificate by id
export const fetchDeathCertificate = createAsyncThunk(
  "birthAndDeth/fetchDeathCertificate",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/death-certificate/${id}`);
      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue(text || "Failed to fetch death certificate");
      }
      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// Update Death Certificate
export const updateDeathCertificate = createAsyncThunk(
  "birthAndDeth/updateDeathCertificate",
  async ({ id, deathData }, { rejectWithValue }) => {
    try {
      // Resolve numeric patientVisitId from form
      const payload = {
        id: id, // Include ID in payload
        fullName: deathData.deceasedName,
        gender: deathData.gender,
        dateOfDeath: deathData.deathDate,
        timeOfDeath: deathData.deathTime,
        ageAtDeath: Number(deathData.age) || null,
        causeOfDeath: deathData.cause,
        placeOfDeath: deathData.place,
        address: deathData.address,
        attendingDoctor: deathData.doctor,
        // include contactNumber and dateOfBirth in update payload as well
        contactNumber: deathData.contactNumber || null,
        dateOfBirth: deathData.birthDate || null,
        issueDate: deathData.issueDate,
        // backend expects patientVisitId (numeric Long)
        patientVisitId: deathData.patientVisitId ? Number(deathData.patientVisitId) : null,
      };

      console.log("Update Payload being sent:", payload);

      const response = await fetch(`${API_BASE_URL}/death-certificate/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return rejectWithValue(
          errorData || "Failed to update death certificate"
        );
      }

      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

const birthAndDethSlice = createSlice({
  name: "birthAndDeth",
  initialState: {
    mothers: [],
    patients: [],
    birthReports: [],
    deathCertificates: [],
    status: "idle", // for fetchMothers
    error: null, // for fetchMothers
    creationStatus: "idle", // for createBirthCertificate
    creationError: null, // for createBirthCertificate
    updateStatus: "idle", // for updateBirthCertificate
    updateError: null, // for updateBirthCertificate
    deathCreationStatus: "idle",
    deathCreationError: null,
    searchStatus: "idle",
    searchError: null,
    birthReportsStatus: "idle", // for fetchBirthReports
    birthReportsError: null, // for fetchBirthReports
    deathCertificatesStatus: "idle",
    deathCertificatesError: null,
    selectedDeathCertificate: null,
    selectedDeathCertificateStatus: "idle",
    selectedDeathCertificateError: null,
    deathUpdateStatus: "idle",
    deathUpdateError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMothers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMothers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.mothers = action.payload;
      })
      .addCase(fetchMothers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      // Reducers for createBirthCertificate
      .addCase(createBirthCertificate.pending, (state) => {
        state.creationStatus = "loading";
        state.creationError = null;
      })
      .addCase(createBirthCertificate.fulfilled, (state) => {
        state.creationStatus = "succeeded";
      })
      .addCase(createBirthCertificate.rejected, (state, action) => {
        state.creationStatus = "failed";
        state.creationError = action.payload || action.error.message;
      })
      // Reducers for updateBirthCertificate
      .addCase(updateBirthCertificate.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateBirthCertificate.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        // Update the birth report in the birthReports array if it exists
        const updatedReport = action.payload;
        if (updatedReport && updatedReport.id) {
          const index = state.birthReports.findIndex(
            (report) => report.id === updatedReport.id
          );
          if (index !== -1) {
            state.birthReports[index] = updatedReport;
          }
        }
      })
      .addCase(updateBirthCertificate.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload || action.error.message;
      });

    // Reducers for createDeathCertificate
    builder
      .addCase(createDeathCertificate.pending, (state) => {
        state.deathCreationStatus = "loading";
        state.deathCreationError = null;
      })
      .addCase(createDeathCertificate.fulfilled, (state) => {
        state.deathCreationStatus = "succeeded";
      })
      .addCase(createDeathCertificate.rejected, (state, action) => {
        state.deathCreationStatus = "failed";
        state.deathCreationError = action.payload || action.error.message;
      });

    // Search patients
    builder
      .addCase(searchPatients.pending, (state) => {
        state.searchStatus = "loading";
        state.searchError = null;
      })
      .addCase(searchPatients.fulfilled, (state, action) => {
        state.searchStatus = "succeeded";
        state.patients = action.payload;
      })
      .addCase(searchPatients.rejected, (state, action) => {
        state.searchStatus = "failed";
        state.searchError = action.payload || action.error.message;
      });

    // Fetch birth reports
    builder
      .addCase(fetchBirthReports.pending, (state) => {
        state.birthReportsStatus = "loading";
        state.birthReportsError = null;
      })
      .addCase(fetchBirthReports.fulfilled, (state, action) => {
        state.birthReportsStatus = "succeeded";
        state.birthReports = action.payload;
      })
      .addCase(fetchBirthReports.rejected, (state, action) => {
        state.birthReportsStatus = "failed";
        state.birthReportsError = action.payload || action.error.message;
      });

    // Fetch death certificates (list)
    builder
      .addCase(fetchDeathCertificates.pending, (state) => {
        state.deathCertificatesStatus = "loading";
        state.deathCertificatesError = null;
      })
      .addCase(fetchDeathCertificates.fulfilled, (state, action) => {
        state.deathCertificatesStatus = "succeeded";
        state.deathCertificates = action.payload;
      })
      .addCase(fetchDeathCertificates.rejected, (state, action) => {
        state.deathCertificatesStatus = "failed";
        state.deathCertificatesError = action.payload || action.error.message;
      });

    // Fetch single death certificate
    builder
      .addCase(fetchDeathCertificate.pending, (state) => {
        state.selectedDeathCertificateStatus = "loading";
        state.selectedDeathCertificateError = null;
      })
      .addCase(fetchDeathCertificate.fulfilled, (state, action) => {
        state.selectedDeathCertificateStatus = "succeeded";
        state.selectedDeathCertificate = action.payload;
      })
      .addCase(fetchDeathCertificate.rejected, (state, action) => {
        state.selectedDeathCertificateStatus = "failed";
        state.selectedDeathCertificateError =
          action.payload || action.error.message;
      })
      // Update death certificate
      .addCase(updateDeathCertificate.pending, (state) => {
        state.deathUpdateStatus = "loading";
        state.deathUpdateError = null;
      })
      .addCase(updateDeathCertificate.fulfilled, (state, action) => {
        state.deathUpdateStatus = "succeeded";
        const updated = action.payload;
        if (updated) {
          state.selectedDeathCertificate = updated;
          const idx = state.deathCertificates.findIndex(
            (d) => d.id === updated.id || d.patientId === updated.patientId
          );
          if (idx !== -1) state.deathCertificates[idx] = updated;
        }
      })
      .addCase(updateDeathCertificate.rejected, (state, action) => {
        state.deathUpdateStatus = "failed";
        state.deathUpdateError = action.payload || action.error.message;
      });
  },
});

export default birthAndDethSlice.reducer;

export const selectAllMothers = (state) => state.birthAndDeth?.mothers;
export const selectMothersStatus = (state) => state.birthAndDeth?.status;
export const selectMothersError = (state) => state.birthAndDeth?.error;
export const selectCreationStatus = (state) =>
  state.birthAndDeth?.creationStatus;
export const selectCreationError = (state) => state.birthAndDeth?.creationError;
export const selectUpdateStatus = (state) => state.birthAndDeth?.updateStatus;
export const selectUpdateError = (state) => state.birthAndDeth?.updateError;
export const selectDeathCreationStatus = (state) =>
  state.birthAndDeth?.deathCreationStatus;
export const selectDeathCreationError = (state) =>
  state.birthAndDeth?.deathCreationError;
export const selectPatients = (state) => state.birthAndDeth?.patients;
export const selectPatientsStatus = (state) => state.birthAndDeth?.searchStatus;
export const selectPatientsError = (state) => state.birthAndDeth?.searchError;
export const selectBirthReports = (state) => state.birthAndDeth?.birthReports;
export const selectBirthReportsStatus = (state) =>
  state.birthAndDeth?.birthReportsStatus;
export const selectBirthReportsError = (state) =>
  state.birthAndDeth?.birthReportsError;

// Death certificates selectors
export const selectDeathCertificates = (state) =>
  state.birthAndDeth?.deathCertificates;
export const selectDeathCertificatesStatus = (state) =>
  state.birthAndDeth?.deathCertificatesStatus;
export const selectDeathCertificatesError = (state) =>
  state.birthAndDeth?.deathCertificatesError;

export const selectSelectedDeathCertificate = (state) =>
  state.birthAndDeth?.selectedDeathCertificate;
export const selectSelectedDeathCertificateStatus = (state) =>
  state.birthAndDeth?.selectedDeathCertificateStatus;
export const selectSelectedDeathCertificateError = (state) =>
  state.birthAndDeth?.selectedDeathCertificateError;
export const selectDeathUpdateStatus = (state) =>
  state.birthAndDeth?.deathUpdateStatus;
export const selectDeathUpdateError = (state) =>
  state.birthAndDeth?.deathUpdateError;

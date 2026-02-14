import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// GET /api/v1/blood-stock
export const fetchStock = createAsyncThunk(
  'bloodStock/fetchStock',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/v1/blood-stock`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
      })
      
      if (!res.ok) {
        const text = await res.text()
        return rejectWithValue({ status: res.status, message: text || res.statusText })
      }
      const data = await res.json()
      return data
    } catch (err) {
      return rejectWithValue({ message: err.message })
    }
  }
)

// POST /api/v1/blood-stock/{stockId}/use-unit/details
// Use blood unit for a patient
export const useUnit = createAsyncThunk(
  'bloodStock/useUnit',
  async (useData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      const { stockId, unitsUsed, patientVisitId } = useData;
      
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/v1/blood-stock/${stockId}/use-unit/details`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ unitsUsed, patientVisitId }),
      })
      
      if (!res.ok) {
        const text = await res.text()
        return rejectWithValue({ status: res.status, message: text || res.statusText })
      }
      const data = await res.json()
      return data
    } catch (err) {
      return rejectWithValue({ message: err.message })
    }
  }
)

const bloodStockSlice = createSlice({
  name: 'bloodStock',
  initialState: { items: [], loading: false, error: null, success: false },
  reducers: {
    clearStock(state) {
      state.items = []
      state.loading = false
      state.error = null
      state.success = false
    },
    updateStockItems(state, action) {
      state.items = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStock.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchStock.fulfilled, (state, action) => { state.loading = false; state.items = action.payload })
      .addCase(fetchStock.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })
      // Use Unit
      .addCase(useUnit.pending, (state) => { state.loading = true; state.error = null; state.success = false })
      .addCase(useUnit.fulfilled, (state, action) => { state.loading = false; state.success = true })
      .addCase(useUnit.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error; state.success = false })
  }
})

export const { clearStock, updateStockItems } = bloodStockSlice.actions
export default bloodStockSlice.reducer

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// GET /api/v1/blood-stocks
export const fetchStock = createAsyncThunk(
  'bloodStock/fetchStock',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('http://192.168.1.38:8080/api/v1/blood-stock', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (!res.ok) {
        const text = await res.text()
       
        return rejectWithValue({ status: res.status, message: text || res.statusText })
      }
      const data = await res.json()
      return data
       console.log("Stock Data"+data)
    } catch (err) {
      return rejectWithValue({ message: err.message })
    }
  }
)

const bloodStockSlice = createSlice({
  name: 'bloodStock',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    clearStock(state) {
      state.items = []
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStock.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchStock.fulfilled, (state, action) => { state.loading = false; state.items = action.payload })
      .addCase(fetchStock.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error })
  }
})

export const { clearStock } = bloodStockSlice.actions
export default bloodStockSlice.reducer

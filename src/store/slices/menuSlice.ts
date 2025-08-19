import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category?: string;
  isAvailable: boolean;
}

interface MenuState {
  items: MenuItem[];
  loading: boolean;
}

const initialState: MenuState = {
  items: [],
  loading: false
};

export const fetchMenu = createAsyncThunk('menu/fetch', async () => {
  const res = await axios.get(`/api/menu`);
  return res.data as MenuItem[];
});

const slice = createSlice({
  name: 'menu',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchMenu.pending, (state) => { state.loading = true; })
      .addCase(fetchMenu.fulfilled, (state, action: PayloadAction<MenuItem[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMenu.rejected, (state) => { state.loading = false; });
  }
});

export default slice.reducer;



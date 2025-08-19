import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import type { AppDispatch, RootState } from '../index';

export type OrderStatus = 'NEW' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELIVERED' | 'PAID' | 'CANCELLED';

export interface OrderItem { item: string; nameSnapshot?: string; priceSnapshot?: number; quantity: number; notes?: string }
export interface Order { _id: string; table: { _id: string; tableNumber: number }; status: OrderStatus; items: OrderItem[]; totalAmount: number; createdAt: string }

interface OrdersState {
  list: Order[];
  loading: boolean;
  socket?: any;
}

const initialState: OrdersState = { list: [], loading: false };

export const fetchOrders = createAsyncThunk('orders/fetch', async () => {
  const res = await axios.get(`/api/orders`);
  return res.data as Order[];
});

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async (payload: { id: string; status: OrderStatus }) => {
    const res = await axios.post(`/api/orders/${payload.id}/status`, { status: payload.status });
    return res.data as Order;
  }
);

const slice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setSocket(state, action: PayloadAction<any>) {
      state.socket = action.payload;
    },
    orderPushed(state, action: PayloadAction<Order>) {
      state.list.unshift(action.payload);
    },
    orderUpdated(state, action: PayloadAction<Order>) {
      const idx = state.list.findIndex(o => o._id === action.payload._id);
      if (idx >= 0) state.list[idx] = action.payload; else state.list.unshift(action.payload);
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchOrders.rejected, (state) => { state.loading = false; })
      .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<Order>) => {
        const idx = state.list.findIndex(o => o._id === action.payload._id);
        if (idx >= 0) state.list[idx] = action.payload;
      });
  }
});

export const { setSocket, orderPushed, orderUpdated } = slice.actions;
export default slice.reducer;

export const connectSocket = (payload: { token?: string; role?: string }) => (dispatch: AppDispatch, getState: () => RootState) => {
  const existing = getState().orders.socket;
  if (existing) return;
  if (typeof window !== 'undefined') {
    // ensure server is initialized
    fetch('/api/socketio');
  }
  const socket = io(undefined, { query: { role: payload.role || 'ADMIN' } });
  socket.on('orders:new', (order: Order) => {
    dispatch(orderPushed(order));
  });
  socket.on('orders:update', (order: Order) => {
    dispatch(orderUpdated(order));
  });
  dispatch(setSocket(socket));
};



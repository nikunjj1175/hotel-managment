import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'KITCHEN' | 'DELIVERY';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  error: null,
  hydrated: false
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }) => {
    const res = await axios.post(`/api/auth/login`, payload);
    return res.data as { token: string; user: AuthUser };
  }
);

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ token: string | null; user: AuthUser | null }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.hydrated = true;
    },
    setHydrated(state) {
      state.hydrated = true;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.hydrated = true;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth');
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; user: AuthUser }>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth', JSON.stringify(action.payload));
        }
      })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Login failed'; });
  }
});

export const { logout } = slice.actions;
export const { setAuth, setHydrated } = slice.actions;
export default slice.reducer;



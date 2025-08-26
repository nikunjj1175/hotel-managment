import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Role } from '../../utils/roles';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  cafeId?: string;
  permissions: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface Cafe {
  _id: string;
  name: string;
  logo?: string;
  address: string;
  contactNumber: string;
  contactEmail: string;
  subscriptionPlan: {
    name: string;
    type: 'MONTHLY' | 'YEARLY' | 'TRIAL';
    price: number;
    features: string[];
    maxTables: number;
    maxStaff: number;
  };
  config: {
    kitchenEnabled: boolean;
    waiterEnabled: boolean;
    managerEnabled: boolean;
    customDomain?: string;
    paymentGateway?: {
      provider: string;
      keys: Record<string, string>;
    };
  };
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  paymentStatus: 'ACTIVE' | 'EXPIRED' | 'OVERDUE';
}

interface AuthState {
  user: User | null;
  cafe: Cafe | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  cafe: null,
  token: null,
  loading: false,
  error: null,
  hydrated: false,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await axios.post('/api/auth/login', credentials);
    return response.data;
  }
);

export const registerSuperAdmin = createAsyncThunk(
  'auth/registerSuperAdmin',
  async (userData: { name: string; email: string; password: string }) => {
    const response = await axios.post('/api/auth/register-super-admin', userData);
    return response.data;
  }
);

export const createCafe = createAsyncThunk(
  'auth/createCafe',
  async (cafeData: {
    name: string;
    address: string;
    contactNumber: string;
    contactEmail: string;
    subscriptionPlan: {
      name: string;
      type: 'MONTHLY' | 'YEARLY' | 'TRIAL';
      price: number;
      features: string[];
      maxTables: number;
      maxStaff: number;
    };
    config: {
      kitchenEnabled: boolean;
      waiterEnabled: boolean;
      managerEnabled: boolean;
    };
  }) => {
    const response = await axios.post('/api/cafes', cafeData);
    return response.data;
  }
);

export const createCafeAdmin = createAsyncThunk(
  'auth/createCafeAdmin',
  async (userData: {
    name: string;
    email: string;
    password: string;
    cafeId: string;
  }) => {
    const response = await axios.post('/api/users', {
      ...userData,
      role: 'CAFE_ADMIN'
    });
    return response.data;
  }
);

export const refreshAuth = createAsyncThunk(
  'auth/refresh',
  async () => {
    const response = await axios.post('/api/auth/refresh');
    return response.data;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await axios.post('/api/auth/logout');
  }
);

export const loadCafeData = createAsyncThunk(
  'auth/loadCafeData',
  async (cafeId: string) => {
    const response = await axios.get(`/api/cafes/${cafeId}`);
    return response.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      if (state.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      }
    },
    setHydrated: (state, action: PayloadAction<boolean>) => {
      state.hydrated = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      if (state.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateCafe: (state, action: PayloadAction<Partial<Cafe>>) => {
      if (state.cafe) {
        state.cafe = { ...state.cafe, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        if (state.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      
      // Register Super Admin
      .addCase(registerSuperAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerSuperAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        if (state.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      })
      .addCase(registerSuperAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      
      // Create Cafe
      .addCase(createCafe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCafe.fulfilled, (state, action) => {
        state.loading = false;
        state.cafe = action.payload;
        state.error = null;
      })
      .addCase(createCafe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create cafe';
      })
      
      // Create Cafe Admin
      .addCase(createCafeAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCafeAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createCafeAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create cafe admin';
      })
      
      // Refresh Auth
      .addCase(refreshAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        if (state.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.cafe = null;
        state.token = null;
        delete axios.defaults.headers.common['Authorization'];
      })
      
      // Load Cafe Data
      .addCase(loadCafeData.fulfilled, (state, action) => {
        state.cafe = action.payload;
      });
  },
});

export const { setAuth, setHydrated, setToken, clearError, updateUser, updateCafe } = authSlice.actions;
export default authSlice.reducer;



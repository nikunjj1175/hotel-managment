import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Role } from '../../utils/roles';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: '/api',
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  // Get token from localStorage if available
  if (typeof window !== 'undefined') {
    try {
      const auth = localStorage.getItem('auth');
      if (auth) {
        const { token } = JSON.parse(auth);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Axios interceptor - Added auth header:', `Bearer ${token.substring(0, 20)}...`);
        } else {
          console.log('Axios interceptor - No token found in auth data');
        }
      } else {
        console.log('Axios interceptor - No auth data in localStorage');
      }
    } catch (error) {
      console.error('Axios interceptor - Error parsing auth data:', error);
    }
  }
  return config;
});

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        console.log('Token expired, attempting to refresh...');
        const refreshResponse = await axios.post('/api/auth/refresh');
        const { token } = refreshResponse.data;
        
        // Update token in localStorage
        if (typeof window !== 'undefined') {
          try {
            const auth = localStorage.getItem('auth');
            if (auth) {
              const authData = JSON.parse(auth);
              authData.token = token;
              localStorage.setItem('auth', JSON.stringify(authData));
              console.log('Token refreshed and updated in localStorage');
            }
          } catch (e) {
            console.error('Error updating token in localStorage:', e);
          }
        }
        
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

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
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Login failed';
      const code = err?.response?.data?.code;
      return rejectWithValue({ message, code });
    }
  }
);

export const registerSuperAdmin = createAsyncThunk(
  'auth/registerSuperAdmin',
  async (userData: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register-super-admin', userData);
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
    console.log('createCafe - Starting cafe creation with data:', cafeData);
    console.log('createCafe - Current axios default headers:', api.defaults.headers);
    
    const response = await api.post('/cafes', cafeData);
    console.log('createCafe - Response received:', response.status);
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
    const response = await api.post('/users', {
      ...userData,
      role: 'CAFE_ADMIN'
    });
    return response.data;
  }
);

export const refreshAuth = createAsyncThunk(
  'auth/refresh',
  async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await api.post('/auth/logout');
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth');
      } catch {}
    }
  }
);

export const loadCafeData = createAsyncThunk(
  'auth/loadCafeData',
  async (cafeId: string) => {
    const response = await api.get(`/cafes/${cafeId}`);
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
        console.log('setAuth - Token set in axios defaults');
      }
    },
    setHydrated: (state, action: PayloadAction<boolean>) => {
      state.hydrated = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      if (state.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        console.log('setToken - Token set in axios defaults');
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
          console.log('Login fulfilled - Token set in axios defaults');
        }
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('auth', JSON.stringify({ token: state.token, user: state.user }));
            console.log('Login fulfilled - Token stored in localStorage');
          } catch (error) {
            console.error('Login fulfilled - Error storing in localStorage:', error);
          }
        }
      })
      .addCase(login.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message || 'Login failed';
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
        state.token = action.payload.token;
        if (state.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
          console.log('Refresh auth fulfilled - Token updated in axios defaults');
          
          // Update localStorage with new token
          if (typeof window !== 'undefined') {
            try {
              const auth = localStorage.getItem('auth');
              if (auth) {
                const authData = JSON.parse(auth);
                authData.token = state.token;
                localStorage.setItem('auth', JSON.stringify(authData));
              }
            } catch (error) {
              console.error('Error updating token in localStorage after refresh:', error);
            }
          }
        }
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.cafe = null;
        state.token = null;
        delete axios.defaults.headers.common['Authorization'];
        console.log('Logout fulfilled - Auth headers cleared');
      })
      
      // Load Cafe Data
      .addCase(loadCafeData.fulfilled, (state, action) => {
        state.cafe = action.payload;
      });
  },
});

export const { setAuth, setHydrated, setToken, clearError, updateUser, updateCafe } = authSlice.actions;
export default authSlice.reducer;



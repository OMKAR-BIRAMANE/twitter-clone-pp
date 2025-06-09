import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: user || null,
  isAuthenticated: !!user, // Add isAuthenticated property
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      return await authService.login(userData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

// Refresh token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, thunkAPI) => {
    try {
      const { auth } = thunkAPI.getState();
      if (!auth.user) return thunkAPI.rejectWithValue('No refresh token available');
      
      return await authService.refreshToken(auth.user.refreshToken);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload
        };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.isAuthenticated = true; // Set isAuthenticated to true
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.isAuthenticated = false; // Set isAuthenticated to false
      })
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.isAuthenticated = true; // Set isAuthenticated to true
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.isAuthenticated = false; // Set isAuthenticated to false
      })
      // Logout case
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false; // Set isAuthenticated to false
      })
      // Refresh token cases
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.user = {
          ...state.user,
          token: action.payload.token,
          refreshToken: action.payload.refreshToken
        };
        state.isAuthenticated = true; // Set isAuthenticated to true
        localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false; // Set isAuthenticated to false
        localStorage.removeItem('user');
      });
  },
});

export const { reset, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
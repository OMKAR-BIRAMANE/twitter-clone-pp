import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

const initialState = {
  users: [],
  currentProfile: null,
  onlineUsers: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Get user profile
export const getUserProfile = createAsyncThunk(
  'user/getUserProfile',
  async (username, thunkAPI) => {
    try {
      return await userService.getUserProfile(username);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all users
export const getAllUsers = createAsyncThunk(
  'user/getAllUsers',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await userService.getAllUsers(token);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Follow user
export const followUser = createAsyncThunk(
  'user/followUser',
  async (userId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await userService.followUser(userId, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Unfollow user
export const unfollowUser = createAsyncThunk(
  'user/unfollowUser',
  async (userId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await userService.unfollowUser(userId, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (userData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await userService.updateUserProfile(userData, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    clearCurrentProfile: (state) => {
      state.currentProfile = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get user profile cases
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentProfile = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get all users cases
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Follow user cases
      .addCase(followUser.fulfilled, (state, action) => {
        state.isSuccess = true;
        // Update current profile if it's the user being followed
        if (state.currentProfile && state.currentProfile._id === action.payload.followedUser) {
          state.currentProfile = {
            ...state.currentProfile,
            followers: [...state.currentProfile.followers, action.payload.currentUser]
          };
        }
        // Update users list
        state.users = state.users.map(user => 
          user._id === action.payload.followedUser 
            ? { ...user, followers: [...user.followers, action.payload.currentUser] }
            : user
        );
      })
      // Unfollow user cases
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.isSuccess = true;
        // Update current profile if it's the user being unfollowed
        if (state.currentProfile && state.currentProfile._id === action.payload.unfollowedUser) {
          state.currentProfile = {
            ...state.currentProfile,
            followers: state.currentProfile.followers.filter(
              id => id !== action.payload.currentUser
            )
          };
        }
        // Update users list
        state.users = state.users.map(user => 
          user._id === action.payload.unfollowedUser 
            ? { 
                ...user, 
                followers: user.followers.filter(id => id !== action.payload.currentUser) 
              }
            : user
        );
      })
      // Update user profile cases
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Update current profile if it's the same user
        if (state.currentProfile && state.currentProfile._id === action.payload._id) {
          state.currentProfile = action.payload;
        }
        // Update users list
        state.users = state.users.map(user => 
          user._id === action.payload._id ? action.payload : user
        );
      });
  },
});

export const { reset, setOnlineUsers, clearCurrentProfile } = userSlice.actions;
export default userSlice.reducer;
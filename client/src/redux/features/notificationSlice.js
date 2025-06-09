import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService';

const initialState = {
  notifications: [],
  unreadCount: 0,
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Get user notifications
export const getUserNotifications = createAsyncThunk(
  'notification/getUserNotifications',
  async (page = 1, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await notificationService.getUserNotifications(page, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  'notification/markNotificationAsRead',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await notificationService.markNotificationAsRead(id, token);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
  'notification/markAllNotificationsAsRead',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await notificationService.markAllNotificationsAsRead(token);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await notificationService.deleteNotification(id, token);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete all notifications
export const deleteAllNotifications = createAsyncThunk(
  'notification/deleteAllNotifications',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await notificationService.deleteAllNotifications(token);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    addNewNotification: (state, action) => {
      state.notifications.data = [action.payload, ...state.notifications.data || []];
      state.unreadCount += 1;
    },
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get user notifications cases
      .addCase(getUserNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getUserNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Mark notification as read cases
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const id = action.payload;
        state.notifications.data = state.notifications.data.map(notification => 
          notification._id === id ? { ...notification, read: true } : notification
        );
        if (state.unreadCount > 0) state.unreadCount -= 1;
      })
      // Mark all notifications as read cases
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.data = state.notifications.data.map(notification => 
          ({ ...notification, read: true })
        );
        state.unreadCount = 0;
      })
      // Delete notification cases
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const deletedNotification = state.notifications.data.find(
          notification => notification._id === id
        );
        state.notifications.data = state.notifications.data.filter(
          notification => notification._id !== id
        );
        if (deletedNotification && !deletedNotification.read && state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      // Delete all notifications cases
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.notifications.data = [];
        state.unreadCount = 0;
      });
  },
});

export const { reset, addNewNotification, updateUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
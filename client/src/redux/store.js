import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import userReducer from './features/userSlice';
import tweetReducer from './features/tweetSlice';
import notificationReducer from './features/notificationSlice';
import messageReducer from './features/messageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    tweet: tweetReducer,
    notification: notificationReducer,
    message: messageReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
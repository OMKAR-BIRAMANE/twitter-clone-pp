import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { refreshToken } from './redux/features/authSlice';
import { io } from 'socket.io-client';
import { addNewTweet, updateTweetInState } from './redux/features/tweetSlice';
import { addNewNotification, updateUnreadCount } from './redux/features/notificationSlice';
import { addNewMessage, updateUnreadCount as incrementMessageUnreadCount } from './redux/features/messageSlice';
import { setOnlineUsers } from './redux/features/userSlice';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Bookmarks from './pages/Bookmarks';
import TweetDetail from './pages/TweetDetail';

// Create socket instance
let socket;

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  
  if (isLoading) {
    return null; // or a loading spinner
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Public route component (accessible only when not logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  
  if (isLoading) {
    return null; // or a loading spinner
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // Create theme
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1DA1F2',
      },
      secondary: {
        main: '#14171A',
      },
      background: {
        default: '#FFFFFF',
        paper: '#FFFFFF',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 'bold',
          },
        },
      },
    },
  });
  
  // Check if user is authenticated on app load
  useEffect(() => {
    dispatch(refreshToken());
  }, [dispatch]);
  
  // Set up socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket
      socket = io('http://localhost:5000', {
        withCredentials: true,
      });
      
      // Socket event listeners
      socket.on('connect', () => {
        console.log('Connected to socket server');
      });
      
      socket.on('tweet', (tweet) => {
        dispatch(addNewTweet(tweet));
      });
      
      socket.on('tweetUpdate', (tweet) => {
        dispatch(updateTweetInState(tweet));
      });
      
      socket.on('notification', (notification) => {
        dispatch(addNewNotification(notification));
        dispatch(updateUnreadCount());
      });
      
      socket.on('message', (message) => {
        dispatch(addNewMessage(message));
        if (message.sender !== user._id) {
          dispatch(incrementMessageUnreadCount());
        }
      });
      
      // Listen for online users update
      socket.on('onlineUsers', (users) => {
        dispatch(setOnlineUsers(users));
      });
      
      socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });
      
      // Clean up on unmount
      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated, user, dispatch]);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          
          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/explore/hashtag/:hashtag" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/messages/:conversationId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
          <Route path="/tweet/:tweetId" element={<ProtectedRoute><TweetDetail /></ProtectedRoute>} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
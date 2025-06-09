import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getBookmarks, clearBookmarks } from '../redux/features/tweetSlice';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import TweetList from '../components/TweetList';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';

const Bookmarks = () => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { bookmarks, isLoading } = useSelector((state) => state.tweet);
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    if (user) {
      dispatch(getBookmarks({ page: 1, limit: 10 }));
      setPage(2);
      setHasMore(true);
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate, user]);
  
  const loadMoreBookmarks = async () => {
    if (!hasMore || isLoading) return;
    
    try {
      const resultAction = await dispatch(getBookmarks({ page, limit: 10 }));
      const payload = resultAction.payload;
      
      if (payload && payload.bookmarks.length < 10) {
        setHasMore(false);
      }
      
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Error loading more bookmarks:', error);
    }
  };
  
  const handleClearBookmarks = async () => {
    try {
      await dispatch(clearBookmarks()).unwrap();
      setClearDialogOpen(false);
      setHasMore(false);
    } catch (error) {
      console.error('Failed to clear bookmarks:', error);
    }
  };
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Sidebar */}
      {!isMobile && (
        <Box sx={{ width: 275, flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <Sidebar />
        </Box>
      )}
      
      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1, 
        maxWidth: 600, 
        borderLeft: `1px solid ${theme.palette.divider}`,
        borderRight: `1px solid ${theme.palette.divider}`,
        mx: 'auto'
      }}>
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          position: 'sticky', 
          top: 0, 
          zIndex: 10, 
          backgroundColor: theme.palette.background.default,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Bookmarks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{user?.username}
              </Typography>
            </Box>
          </Box>
          
          {bookmarks.length > 0 && (
            <Button 
              startIcon={<DeleteIcon />} 
              color="error"
              onClick={() => setClearDialogOpen(true)}
              sx={{ borderRadius: 30 }}
            >
              Clear all
            </Button>
          )}
        </Box>
        
        {/* Bookmarks List */}
        <TweetList 
          tweets={bookmarks} 
          hasMore={hasMore} 
          loadMore={loadMoreBookmarks} 
          loading={isLoading} 
          emptyMessage="You haven't added any Tweets to your Bookmarks yet"
        />
      </Box>
      
      {/* Right Sidebar */}
      {!isMobile && (
        <Box sx={{ width: 350, flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <RightSidebar />
        </Box>
      )}
      
      {/* Clear Bookmarks Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
      >
        <DialogTitle>Clear all Bookmarks?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            This can't be undone and you'll remove all Tweets you've added to your Bookmarks.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleClearBookmarks} color="error" variant="contained">
            Clear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bookmarks;

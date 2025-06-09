import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getTweetById, getReplies } from '../redux/features/tweetSlice';
import {
  Box,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import TweetItem from '../components/TweetItem';
import TweetForm from '../components/TweetForm';
import TweetList from '../components/TweetList';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';

const TweetDetail = () => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { tweetId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { currentTweet, replies, isLoading } = useSelector((state) => state.tweet);
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    dispatch(getTweetById(tweetId));
    dispatch(getReplies({ tweetId, page: 1, limit: 10 }));
    setPage(2);
    setHasMore(true);
  }, [dispatch, tweetId]);
  
  const loadMoreReplies = async () => {
    if (!hasMore || isLoading) return;
    
    try {
      const resultAction = await dispatch(getReplies({ tweetId, page, limit: 10 }));
      const payload = resultAction.payload;
      
      if (payload && payload.replies.length < 10) {
        setHasMore(false);
      }
      
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Error loading more replies:', error);
    }
  };
  
  if (isLoading && !currentTweet) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!currentTweet && !isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Typography variant="h5" gutterBottom>
          Tweet not found
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          This Tweet was deleted or is unavailable.
        </Typography>
      </Box>
    );
  }
  
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
          alignItems: 'center'
        }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" fontWeight="bold">
            Tweet
          </Typography>
        </Box>
        
        {/* Tweet Detail */}
        {currentTweet && (
          <Box>
            <TweetItem tweet={currentTweet} isDetailView={true} />
            
            {user && (
              <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <TweetForm placeholder="Tweet your reply" parentId={tweetId} />
              </Box>
            )}
            
            <Divider />
            
            {/* Replies */}
            <TweetList 
              tweets={replies} 
              hasMore={hasMore} 
              loadMore={loadMoreReplies} 
              loading={isLoading} 
              emptyMessage="No replies yet"
            />
          </Box>
        )}
      </Box>
      
      {/* Right Sidebar */}
      {!isMobile && (
        <Box sx={{ width: 350, flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <RightSidebar />
        </Box>
      )}
    </Box>
  );
};

export default TweetDetail;
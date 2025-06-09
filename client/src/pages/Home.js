import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTimelineTweets } from '../redux/features/tweetSlice';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import TweetForm from '../components/TweetForm';
import TweetList from '../components/TweetList';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';

const Home = () => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { tweets, isLoading } = useSelector((state) => state.tweet);
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    loadTweets();
  }, []);
  
  const loadTweets = async () => {
    if (!hasMore || isLoading) return;
    
    try {
      const resultAction = await dispatch(getTimelineTweets({ page, limit: 10 }));
      const payload = resultAction.payload;
      
      if (payload && payload.tweets.length < 10) {
        setHasMore(false);
      }
      
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Error loading tweets:', error);
    }
  };
  
  const handleLoadMore = () => {
    loadTweets();
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
        <Box sx={{ 
          p: 2, 
          position: 'sticky', 
          top: 0, 
          zIndex: 10, 
          backgroundColor: theme.palette.background.default,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="h6" fontWeight="bold">Home</Typography>
        </Box>
        
        {user && (
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <TweetForm />
          </Box>
        )}
        
        <Box>
          {tweets.length > 0 ? (
            <TweetList 
              tweets={tweets} 
              hasMore={hasMore} 
              loadMore={handleLoadMore} 
              loading={isLoading} 
            />
          ) : isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No tweets to display. Follow some users to see their tweets here!
              </Typography>
            </Box>
          )}
        </Box>
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

export default Home;
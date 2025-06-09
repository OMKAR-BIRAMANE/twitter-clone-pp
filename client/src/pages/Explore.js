import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getTweetsByHashtag } from '../redux/features/tweetSlice';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import TweetList from '../components/TweetList';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';

// Mock trending data - in a real app, this would come from the backend
const TRENDING_TOPICS = [
  { tag: 'Technology', tweets: 125000 },
  { tag: 'Programming', tweets: 98000 },
  { tag: 'JavaScript', tweets: 87500 },
  { tag: 'React', tweets: 76000 },
  { tag: 'NodeJS', tweets: 65000 },
  { tag: 'WebDevelopment', tweets: 54000 },
  { tag: 'MongoDB', tweets: 43000 },
  { tag: 'ExpressJS', tweets: 32000 },
  { tag: 'Redux', tweets: 21000 },
  { tag: 'MaterialUI', tweets: 10000 }
];

const Explore = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { hashtag } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { tweets, isLoading } = useSelector((state) => state.tweet);
  
  useEffect(() => {
    if (hashtag) {
      dispatch(getTweetsByHashtag({ hashtag, page: 1, limit: 10 }));
      setPage(2);
      setHasMore(true);
    }
  }, [dispatch, hashtag]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchClear = () => {
    setSearchQuery('');
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Remove # if present at the beginning
      const query = searchQuery.trim().startsWith('#') 
        ? searchQuery.trim().substring(1) 
        : searchQuery.trim();
      
      navigate(`/explore/hashtag/${query}`);
    }
  };
  
  const handleHashtagClick = (tag) => {
    navigate(`/explore/hashtag/${tag}`);
  };
  
  const loadMoreTweets = async () => {
    if (!hasMore || isLoading || !hashtag) return;
    
    try {
      const resultAction = await dispatch(getTweetsByHashtag({ hashtag, page, limit: 10 }));
      const payload = resultAction.payload;
      
      if (payload && payload.tweets.length < 10) {
        setHasMore(false);
      }
      
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Error loading more tweets:', error);
    }
  };
  
  const formatTweetCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
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
        }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {hashtag ? `#${hashtag}` : 'Explore'}
          </Typography>
          
          <form onSubmit={handleSearchSubmit}>
            <TextField
              fullWidth
              placeholder="Search hashtags"
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearchClear} edge="end">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 30 }
              }}
            />
          </form>
          
          {!hashtag && (
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant="fullWidth"
              indicatorColor="primary"
              sx={{ mt: 2 }}
            >
              <Tab label="For you" />
              <Tab label="Trending" />
              <Tab label="News" />
              <Tab label="Sports" />
            </Tabs>
          )}
        </Box>
        
        {/* Content */}
        {hashtag ? (
          // Hashtag search results
          <TweetList 
            tweets={tweets} 
            hasMore={hasMore} 
            loadMore={loadMoreTweets} 
            loading={isLoading} 
            emptyMessage={`No tweets found with hashtag #${hashtag}`}
          />
        ) : (
          // Explore content
          <Box>
            {activeTab === 0 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingIcon sx={{ mr: 1 }} />
                  Trending Topics
                </Typography>
                
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                  {TRENDING_TOPICS.map((topic, index) => (
                    <React.Fragment key={topic.tag}>
                      <ListItem 
                        button 
                        onClick={() => handleHashtagClick(topic.tag)}
                        sx={{ py: 2 }}
                      >
                        <ListItemText 
                          primary={
                            <Typography variant="body1" fontWeight="bold">
                              #{topic.tag}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {formatTweetCount(topic.tweets)} tweets
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < TRENDING_TOPICS.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
            
            {activeTab === 1 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Trending content will be displayed here
                </Typography>
              </Box>
            )}
            
            {activeTab === 2 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  News content will be displayed here
                </Typography>
              </Box>
            )}
            
            {activeTab === 3 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Sports content will be displayed here
                </Typography>
              </Box>
            )}
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

export default Explore;
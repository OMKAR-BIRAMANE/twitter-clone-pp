import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, followUser, unfollowUser } from '../redux/features/userSlice';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Paper,
  Divider,
  CircularProgress,
  useTheme
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const RightSidebar = () => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const { users, isLoading } = useSelector((state) => state.user);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  useEffect(() => {
    dispatch(getAllUsers({ limit: 5 }));
  }, [dispatch]);
  
  useEffect(() => {
    if (search.trim()) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        dispatch(getAllUsers({ search, limit: 5 }))
          .then((resultAction) => {
            if (resultAction.payload) {
              setSearchResults(resultAction.payload.users);
            }
          })
          .finally(() => {
            setIsSearching(false);
          });
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [search, dispatch]);
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };
  
  const handleFollowClick = async (userId, isFollowing) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      if (isFollowing) {
        await dispatch(unfollowUser(userId)).unwrap();
      } else {
        await dispatch(followUser(userId)).unwrap();
      }
    } catch (error) {
      console.error('Failed to follow/unfollow user:', error);
    }
  };
  
  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };
  
  // Mock trends data
  const trends = [
    { name: '#JavaScript', tweetCount: '25.5K' },
    { name: '#ReactJS', tweetCount: '15.2K' },
    { name: '#MERN', tweetCount: '10.1K' },
    { name: '#WebDevelopment', tweetCount: '8.7K' },
    { name: '#NodeJS', tweetCount: '7.3K' }
  ];
  
  return (
    <Box sx={{ height: '100%', p: 2 }}>
      {/* Search Bar */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 1, 
          mb: 3, 
          borderRadius: 30,
          backgroundColor: theme.palette.action.hover
        }}
      >
        <TextField
          fullWidth
          placeholder="Search Twitter"
          value={search}
          onChange={handleSearchChange}
          variant="standard"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            disableUnderline: true
          }}
        />
      </Paper>
      
      {/* Search Results */}
      {search.trim() && (
        <Paper sx={{ mb: 3, borderRadius: 4, overflow: 'hidden' }}>
          <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
            Search Results
          </Typography>
          
          {isSearching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={30} />
            </Box>
          ) : searchResults.length > 0 ? (
            <List>
              {searchResults.map((user) => {
                const isFollowing = currentUser && 
                                   user.followers.includes(currentUser._id);
                
                return (
                  <ListItem key={user._id} sx={{ cursor: 'pointer' }}>
                    <ListItemAvatar onClick={() => handleUserClick(user.username)}>
                      <Avatar src={user.profilePicture} alt={user.name} />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={user.name}
                      secondary={`@${user.username}`}
                      onClick={() => handleUserClick(user.username)}
                    />
                    {currentUser && currentUser._id !== user._id && (
                      <Button
                        variant={isFollowing ? "outlined" : "contained"}
                        size="small"
                        onClick={() => handleFollowClick(user._id, isFollowing)}
                        sx={{ borderRadius: 30, minWidth: 100 }}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    )}
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No users found
              </Typography>
            </Box>
          )}
        </Paper>
      )}
      
      {/* Trends */}
      <Paper sx={{ mb: 3, borderRadius: 4, overflow: 'hidden' }}>
        <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
          Trends for you
        </Typography>
        
        <List>
          {trends.map((trend, index) => (
            <React.Fragment key={trend.name}>
              <ListItem 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
                onClick={() => navigate(`/explore/hashtag/${trend.name.substring(1)}`)}
              >
                <ListItemText
                  primary={trend.name}
                  secondary={`${trend.tweetCount} Tweets`}
                />
              </ListItem>
              {index < trends.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
        
        <Box sx={{ p: 2 }}>
          <Typography 
            variant="body2" 
            color="primary" 
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/explore')}
          >
            Show more
          </Typography>
        </Box>
      </Paper>
      
      {/* Who to follow */}
      <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
          Who to follow
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={30} />
          </Box>
        ) : users.length > 0 ? (
          <List>
            {users.map((user, index) => {
              const isFollowing = currentUser && 
                                 user.followers.includes(currentUser._id);
              
              return (
                <React.Fragment key={user._id}>
                  <ListItem sx={{ cursor: 'pointer' }}>
                    <ListItemAvatar onClick={() => handleUserClick(user.username)}>
                      <Avatar src={user.profilePicture} alt={user.name} />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={user.name}
                      secondary={`@${user.username}`}
                      onClick={() => handleUserClick(user.username)}
                    />
                    {currentUser && currentUser._id !== user._id && (
                      <Button
                        variant={isFollowing ? "outlined" : "contained"}
                        size="small"
                        onClick={() => handleFollowClick(user._id, isFollowing)}
                        sx={{ borderRadius: 30, minWidth: 100 }}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    )}
                  </ListItem>
                  {index < users.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No users to display
            </Typography>
          </Box>
        )}
        
        <Box sx={{ p: 2 }}>
          <Typography 
            variant="body2" 
            color="primary" 
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/explore/people')}
          >
            Show more
          </Typography>
        </Box>
      </Paper>
      
      {/* Footer */}
      <Box sx={{ mt: 3, p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Terms of Service · Privacy Policy · Cookie Policy · Accessibility · Ads Info · More · © 2023 Twitter Clone
        </Typography>
      </Box>
    </Box>
  );
};

export default RightSidebar;
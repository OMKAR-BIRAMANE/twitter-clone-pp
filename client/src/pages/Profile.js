import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfile, followUser, unfollowUser, updateUserProfile, clearCurrentProfile } from '../redux/features/userSlice';
import { getUserTweets } from '../redux/features/tweetSlice';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Tabs,
  Tab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Link as LinkIcon,
  CalendarMonth as CalendarIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  AddAPhoto as AddPhotoIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import TweetList from '../components/TweetList';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';

const Profile = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    location: '',
    website: ''
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [coverPictureFile, setCoverPictureFile] = useState(null);
  const [coverPicturePreview, setCoverPicturePreview] = useState('');
  
  const profilePictureInputRef = useRef(null);
  const coverPictureInputRef = useRef(null);
  
  const { username } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { currentProfile, isLoading: isProfileLoading } = useSelector((state) => state.user);
  const { tweets, isLoading: isTweetsLoading } = useSelector((state) => state.tweet);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const isCurrentUser = currentUser && currentProfile && currentUser._id === currentProfile._id;
  const isFollowing = currentUser && currentProfile && currentProfile.followers.includes(currentUser._id);
  
  useEffect(() => {
    dispatch(getUserProfile(username));
    dispatch(getUserTweets({ username, page: 1, limit: 10 }));
    setPage(2);
    setHasMore(true);
    
    // Cleanup function
    return () => {
      dispatch(clearCurrentProfile());
    };
  }, [dispatch, username]);
  
  useEffect(() => {
    if (currentProfile && isCurrentUser) {
      setProfileData({
        name: currentProfile.name || '',
        bio: currentProfile.bio || '',
        location: currentProfile.location || '',
        website: currentProfile.website || ''
      });
    }
  }, [currentProfile, isCurrentUser]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const loadMoreTweets = async () => {
    if (!hasMore || isTweetsLoading) return;
    
    try {
      const resultAction = await dispatch(getUserTweets({ username, page, limit: 10 }));
      const payload = resultAction.payload;
      
      if (payload && payload.tweets.length < 10) {
        setHasMore(false);
      }
      
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Error loading more tweets:', error);
    }
  };
  
  const handleFollowClick = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      if (isFollowing) {
        await dispatch(unfollowUser(currentProfile._id)).unwrap();
      } else {
        await dispatch(followUser(currentProfile._id)).unwrap();
      }
    } catch (error) {
      console.error('Failed to follow/unfollow user:', error);
    }
  };
  
  const handleEditProfile = () => {
    setEditDialogOpen(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfilePictureClick = () => {
    profilePictureInputRef.current.click();
  };
  
  const handleCoverPictureClick = () => {
    coverPictureInputRef.current.click();
  };
  
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };
  
  const handleCoverPictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPictureFile(file);
      setCoverPicturePreview(URL.createObjectURL(file));
    }
  };
  
  const handleSaveProfile = async () => {
    try {
      const userData = {
        ...profileData
      };
      
      if (profilePictureFile) {
        userData.profilePicture = profilePictureFile;
      }
      
      if (coverPictureFile) {
        userData.coverPicture = coverPictureFile;
      }
      
      await dispatch(updateUserProfile(userData)).unwrap();
      setEditDialogOpen(false);
      
      // Cleanup preview URLs
      if (profilePicturePreview) {
        URL.revokeObjectURL(profilePicturePreview);
        setProfilePicturePreview('');
      }
      
      if (coverPicturePreview) {
        URL.revokeObjectURL(coverPicturePreview);
        setCoverPicturePreview('');
      }
      
      setProfilePictureFile(null);
      setCoverPictureFile(null);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };
  
  const handleShowFollowers = () => {
    setFollowersDialogOpen(true);
  };
  
  const handleShowFollowing = () => {
    setFollowingDialogOpen(true);
  };
  
  if (isProfileLoading && !currentProfile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!currentProfile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Typography variant="h5" gutterBottom>
          User not found
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Box>
    );
  }
  
  const joinedDate = format(new Date(currentProfile.createdAt), 'MMMM yyyy');
  
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
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {currentProfile.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tweets.length} Tweets
            </Typography>
          </Box>
        </Box>
        
        {/* Cover Photo */}
        <Box sx={{ position: 'relative', height: 200, backgroundColor: theme.palette.action.hover }}>
          {currentProfile.coverPicture && (
            <Box 
              component="img" 
              src={`/api/images/${currentProfile.coverPicture}`} 
              alt="Cover" 
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </Box>
        
        {/* Profile Info */}
        <Box sx={{ p: 3, position: 'relative' }}>
          {/* Profile Picture */}
          <Avatar 
            src={currentProfile.profilePicture ? `/api/images/${currentProfile.profilePicture}` : undefined} 
            alt={currentProfile.name}
            sx={{ 
              width: 120, 
              height: 120, 
              border: `4px solid ${theme.palette.background.paper}`,
              position: 'absolute',
              top: -60,
              left: 24
            }}
          />
          
          {/* Edit Profile / Follow Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            {isCurrentUser ? (
              <Button 
                variant="outlined" 
                onClick={handleEditProfile}
                sx={{ borderRadius: 30, fontWeight: 'bold' }}
              >
                Edit profile
              </Button>
            ) : (
              <Button 
                variant={isFollowing ? "outlined" : "contained"} 
                onClick={handleFollowClick}
                sx={{ borderRadius: 30, fontWeight: 'bold' }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </Box>
          
          {/* Name and Username */}
          <Box sx={{ mt: 5 }}>
            <Typography variant="h5" fontWeight="bold">
              {currentProfile.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              @{currentProfile.username}
            </Typography>
          </Box>
          
          {/* Bio */}
          {currentProfile.bio && (
            <Typography variant="body1" paragraph>
              {currentProfile.bio}
            </Typography>
          )}
          
          {/* Location, Website, Join Date */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            {currentProfile.location && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {currentProfile.location}
                </Typography>
              </Box>
            )}
            
            {currentProfile.website && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LinkIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography 
                  variant="body2" 
                  color="primary"
                  component="a"
                  href={currentProfile.website.startsWith('http') ? currentProfile.website : `https://${currentProfile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textDecoration: 'none' }}
                >
                  {currentProfile.website}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                Joined {joinedDate}
              </Typography>
            </Box>
          </Box>
          
          {/* Following and Followers */}
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography 
              variant="body2" 
              sx={{ cursor: 'pointer' }}
              onClick={handleShowFollowing}
            >
              <strong>{currentProfile.followingCount}</strong> Following
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ cursor: 'pointer' }}
              onClick={handleShowFollowers}
            >
              <strong>{currentProfile.followersCount}</strong> Followers
            </Typography>
          </Box>
        </Box>
        
        {/* Tabs */}
        <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth"
            indicatorColor="primary"
          >
            <Tab label="Tweets" />
            <Tab label="Replies" />
            <Tab label="Media" />
            <Tab label="Likes" />
          </Tabs>
        </Box>
        
        {/* Tab Content */}
        <Box>
          {activeTab === 0 && (
            <TweetList 
              tweets={tweets} 
              hasMore={hasMore} 
              loadMore={loadMoreTweets} 
              loading={isTweetsLoading} 
              emptyMessage={`@${currentProfile.username} hasn't tweeted yet`}
            />
          )}
          {activeTab === 1 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Replies will be displayed here
              </Typography>
            </Box>
          )}
          {activeTab === 2 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Media tweets will be displayed here
              </Typography>
            </Box>
          )}
          {activeTab === 3 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Liked tweets will be displayed here
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
      
      {/* Edit Profile Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => setEditDialogOpen(false)} sx={{ mr: 1 }}>
              <CloseIcon />
            </IconButton>
            <Typography variant="h6">Edit profile</Typography>
          </Box>
          <Button 
            variant="contained" 
            onClick={handleSaveProfile}
            sx={{ borderRadius: 30 }}
          >
            Save
          </Button>
        </DialogTitle>
        
        <DialogContent>
          {/* Cover Photo */}
          <Box sx={{ position: 'relative', height: 200, backgroundColor: theme.palette.action.hover, mb: 5 }}>
            {(coverPicturePreview || currentProfile.coverPicture) && (
              <Box 
                component="img" 
                src={coverPicturePreview || `/api/images/${currentProfile.coverPicture}`} 
                alt="Cover" 
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.3)'
            }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverPictureChange}
                ref={coverPictureInputRef}
                style={{ display: 'none' }}
              />
              <IconButton 
                onClick={handleCoverPictureClick}
                sx={{ color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              >
                <AddPhotoIcon />
              </IconButton>
            </Box>
            
            {/* Profile Picture */}
            <Box sx={{ position: 'absolute', bottom: -50, left: 24 }}>
              <Avatar 
                src={profilePicturePreview || (currentProfile.profilePicture ? `/api/images/${currentProfile.profilePicture}` : undefined)} 
                alt={currentProfile.name}
                sx={{ 
                  width: 100, 
                  height: 100, 
                  border: `4px solid ${theme.palette.background.paper}`
                }}
              />
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '50%'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  ref={profilePictureInputRef}
                  style={{ display: 'none' }}
                />
                <IconButton 
                  onClick={handleProfilePictureClick}
                  sx={{ color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                  <AddPhotoIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ mt: 4 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={profileData.name}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              fullWidth
              label="Bio"
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
              multiline
              rows={3}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={profileData.location}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={profileData.website}
              onChange={handleInputChange}
              margin="normal"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
      </Dialog>
      
      {/* Followers Dialog */}
      <Dialog 
        open={followersDialogOpen} 
        onClose={() => setFollowersDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => setFollowersDialogOpen(false)} sx={{ mr: 1 }}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6">Followers</Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Followers list will be implemented here
          </Typography>
        </DialogContent>
      </Dialog>
      
      {/* Following Dialog */}
      <Dialog 
        open={followingDialogOpen} 
        onClose={() => setFollowingDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => setFollowingDialogOpen(false)} sx={{ mr: 1 }}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6">Following</Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Following list will be implemented here
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Profile;
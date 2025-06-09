import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../redux/features/authSlice';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Avatar,
  Typography,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  useTheme
} from '@mui/material';
import {
  Home as HomeIcon,
  Search as ExploreIcon,
  NotificationsNone as NotificationsIcon,
  MailOutline as MessagesIcon,
  BookmarkBorder as BookmarksIcon,
  Person as ProfileIcon,
  MoreHoriz as MoreIcon,
  Twitter as TwitterIcon,
  Add as AddIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import TweetForm from './TweetForm';

const Sidebar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [tweetDialogOpen, setTweetDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  const { user } = useSelector((state) => state.auth);
  const { unreadCount: notificationCount } = useSelector((state) => state.notification);
  const { unreadCount: messageCount } = useSelector((state) => state.message);
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogoutClick = () => {
    handleProfileMenuClose();
    setLogoutDialogOpen(true);
  };
  
  const handleLogoutConfirm = () => {
    dispatch(logout());
    setLogoutDialogOpen(false);
    navigate('/login');
  };
  
  const handleTweetClick = () => {
    setTweetDialogOpen(true);
  };
  
  const handleTweetSuccess = () => {
    setTweetDialogOpen(false);
  };
  
  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Explore', icon: <ExploreIcon />, path: '/explore' },
    { 
      text: 'Notifications', 
      icon: (
        <Badge badgeContent={notificationCount} color="error" invisible={!notificationCount}>
          <NotificationsIcon />
        </Badge>
      ), 
      path: '/notifications' 
    },
    { 
      text: 'Messages', 
      icon: (
        <Badge badgeContent={messageCount} color="error" invisible={!messageCount}>
          <MessagesIcon />
        </Badge>
      ), 
      path: '/messages' 
    },
    { text: 'Bookmarks', icon: <BookmarksIcon />, path: '/bookmarks' },
    { text: 'Profile', icon: <ProfileIcon />, path: user ? `/profile/${user.username}` : '/login' }
  ];
  
  return (
    <Box sx={{ height: '100%', p: 2 }}>
      {/* Twitter Logo */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <TwitterIcon color="primary" sx={{ fontSize: 36 }} />
        </Link>
      </Box>
      
      {/* Navigation Menu */}
      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
                         (item.path.includes('/profile') && location.pathname.includes('/profile'));
          
          return (
            <ListItem 
              key={item.text} 
              component={Link} 
              to={item.path}
              sx={{ 
                borderRadius: 30, 
                mb: 1,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                },
                backgroundColor: isActive ? theme.palette.action.selected : 'transparent'
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          );
        })}
      </List>
      
      {/* Tweet Button */}
      <Button
        variant="contained"
        fullWidth
        startIcon={<AddIcon />}
        onClick={handleTweetClick}
        sx={{ 
          mt: 2, 
          borderRadius: 30,
          py: 1.5,
          textTransform: 'none',
          fontWeight: 'bold'
        }}
      >
        Tweet
      </Button>
      
      {/* User Profile */}
      {user && (
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Divider sx={{ my: 2 }} />
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 1, 
              borderRadius: 30,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                cursor: 'pointer'
              }
            }}
            onClick={handleProfileMenuOpen}
          >
            <Avatar src={user.profilePicture} alt={user.name} sx={{ mr: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{user.username}
              </Typography>
            </Box>
            <MoreIcon />
          </Box>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleLogoutClick}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </Box>
      )}
      
      {/* Tweet Dialog */}
      <Dialog
        open={tweetDialogOpen}
        onClose={() => setTweetDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent>
          <TweetForm onSuccess={handleTweetSuccess} />
        </DialogContent>
      </Dialog>
      
      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
      >
        <DialogTitle>Log out of Twitter?</DialogTitle>
        <DialogContent>
          <Typography>You can always log back in at any time.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} color="primary" variant="contained">
            Log out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sidebar;
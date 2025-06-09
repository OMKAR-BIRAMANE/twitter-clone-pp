import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
} from '../redux/features/notificationSlice';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Divider,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  MoreHoriz as MoreIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Favorite as LikeIcon,
  Repeat as RetweetIcon,
  Comment as ReplyIcon,
  PersonAdd as FollowIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import InfiniteScroll from 'react-infinite-scroll-component';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { notifications, isLoading } = useSelector((state) => state.notification);
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    if (user) {
      dispatch(getUserNotifications(1));
      setPage(2);
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate, user]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const loadMoreNotifications = async () => {
    if (!hasMore || isLoading) return;
    
    try {
      const resultAction = await dispatch(getUserNotifications(page));
      const payload = resultAction.payload;
      
      if (payload && payload.notifications.length < 10) {
        setHasMore(false);
      }
      
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Error loading more notifications:', error);
    }
  };
  
  const handleMenuOpen = (event, notification) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedNotification(null);
  };
  
  const handleMarkAsRead = async () => {
    if (selectedNotification) {
      try {
        await dispatch(markNotificationAsRead(selectedNotification._id)).unwrap();
        handleMenuClose();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };
  
  const handleDeleteNotification = async () => {
    if (selectedNotification) {
      try {
        await dispatch(deleteNotification(selectedNotification._id)).unwrap();
        handleMenuClose();
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllNotificationsAsRead()).unwrap();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };
  
  const handleDeleteAllNotifications = async () => {
    try {
      await dispatch(deleteAllNotifications()).unwrap();
      setHasMore(false);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };
  
  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification._id));
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'like':
      case 'retweet':
      case 'reply':
        navigate(`/tweet/${notification.tweet}`);
        break;
      case 'follow':
        navigate(`/profile/${notification.sender.username}`);
        break;
      default:
        break;
    }
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <LikeIcon sx={{ color: 'error.main' }} />;
      case 'retweet':
        return <RetweetIcon sx={{ color: 'success.main' }} />;
      case 'reply':
        return <ReplyIcon sx={{ color: 'primary.main' }} />;
      case 'follow':
        return <FollowIcon sx={{ color: 'primary.main' }} />;
      default:
        return null;
    }
  };
  
  const getNotificationText = (notification) => {
    const senderName = notification.sender?.name || 'Someone';
    
    switch (notification.type) {
      case 'like':
        return `${senderName} liked your tweet`;
      case 'retweet':
        return `${senderName} retweeted your tweet`;
      case 'reply':
        return `${senderName} replied to your tweet`;
      case 'follow':
        return `${senderName} followed you`;
      default:
        return notification.content || 'New notification';
    }
  };
  
  const filteredNotifications = activeTab === 0 
    ? notifications 
    : notifications.filter(notification => notification.type === 'mention');
  
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
            Notifications
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Button 
              size="small" 
              onClick={handleMarkAllAsRead}
              startIcon={<CheckCircleIcon />}
              sx={{ borderRadius: 30 }}
            >
              Mark all as read
            </Button>
            
            <Button 
              size="small" 
              onClick={handleDeleteAllNotifications}
              startIcon={<DeleteIcon />}
              color="error"
              sx={{ borderRadius: 30 }}
            >
              Clear all
            </Button>
          </Box>
          
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth"
            indicatorColor="primary"
          >
            <Tab label="All" />
            <Tab label="Mentions" />
          </Tabs>
        </Box>
        
        {/* Notifications List */}
        <Box>
          {isLoading && page === 2 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                {activeTab === 0 ? 'No notifications yet' : 'No mentions yet'}
              </Typography>
            </Box>
          ) : (
            <InfiniteScroll
              dataLength={filteredNotifications.length}
              next={loadMoreNotifications}
              hasMore={hasMore}
              loader={
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              }
              endMessage={
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                  No more notifications
                </Typography>
              }
            >
              <List sx={{ width: '100%', p: 0 }}>
                {filteredNotifications.map((notification) => (
                  <React.Fragment key={notification._id}>
                    <ListItem 
                      alignItems="flex-start"
                      sx={{ 
                        py: 2, 
                        px: 3, 
                        cursor: 'pointer',
                        backgroundColor: notification.read ? 'inherit' : 'action.hover',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                      secondaryAction={
                        <IconButton edge="end" onClick={(e) => handleMenuOpen(e, notification)}>
                          <MoreIcon />
                        </IconButton>
                      }
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <ListItemAvatar sx={{ minWidth: 56 }}>
                        {getNotificationIcon(notification.type)}
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              src={notification.sender?.profilePicture ? `/api/images/${notification.sender.profilePicture}` : undefined} 
                              alt={notification.sender?.name || 'User'}
                              sx={{ width: 32, height: 32, mr: 1 }}
                            />
                            <Typography 
                              variant="body1"
                              component="span"
                              sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                            >
                              {getNotificationText(notification)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </InfiniteScroll>
          )}
        </Box>
      </Box>
      
      {/* Right Sidebar */}
      {!isMobile && (
        <Box sx={{ width: 350, flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <RightSidebar />
        </Box>
      )}
      
      {/* Notification Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.read && (
          <MenuItem onClick={handleMarkAsRead}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Mark as read" />
          </MenuItem>
        )}
        <MenuItem onClick={handleDeleteNotification}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete notification" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Notifications;
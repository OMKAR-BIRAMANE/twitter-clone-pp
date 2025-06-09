import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllConversations, getConversation, sendMessage, deleteMessage } from '../redux/features/messageSlice';
import { getUserProfile } from '../redux/features/userSlice';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Divider,
  TextField,
  Paper,
  InputAdornment,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Send as SendIcon,
  MoreHoriz as MoreIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Image as ImageIcon,
  EmojiEmotions as EmojiIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import Sidebar from '../components/Sidebar';

const Messages = () => {
  const [messageText, setMessageText] = useState('');
  const [messageImage, setMessageImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showConversation, setShowConversation] = useState(false);
  
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const { conversationId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { conversations, currentConversation, messages, isLoading } = useSelector((state) => state.message);
  const { user } = useSelector((state) => state.auth);
  const { currentProfile } = useSelector((state) => state.user);
  
  useEffect(() => {
    if (user) {
      dispatch(getAllConversations());
      
      if (conversationId) {
        dispatch(getConversation({ userId: conversationId }));
        setShowConversation(true);
      }
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate, user, conversationId]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    // Fetch recipient user data when conversation changes
    if (currentConversation && currentConversation.participants) {
      const recipientId = currentConversation.participants.find(id => id !== user._id);
      if (recipientId) {
        dispatch(getUserProfile(recipientId));
      }
    }
  }, [dispatch, currentConversation, user]);
  
  const handleConversationClick = (conversationId) => {
    navigate(`/messages/${conversationId}`);
    setShowConversation(true);
  };
  
  const handleBackToList = () => {
    navigate('/messages');
    setShowConversation(false);
  };
  
  const handleMessageChange = (e) => {
    setMessageText(e.target.value);
  };
  
  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMessageImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleRemoveImage = () => {
    setMessageImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview('');
    }
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if ((!messageText.trim() && !messageImage) || !currentConversation) return;
    
    try {
      const formData = new FormData();
      formData.append('content', messageText);
      formData.append('recipient', currentConversation.participants.find(id => id !== user._id));
      
      if (messageImage) {
        formData.append('image', messageImage);
      }
      
      await dispatch(sendMessage(formData)).unwrap();
      setMessageText('');
      handleRemoveImage();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  const handleMenuOpen = (event, message) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMessage(null);
  };
  
  const handleDeleteMessage = async () => {
    if (selectedMessage) {
      try {
        await dispatch(deleteMessage(selectedMessage._id)).unwrap();
        handleMenuClose();
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
  };
  
  const getConversationName = (conversation) => {
    if (!conversation || !conversation.participants || !user) return 'Conversation';
    
    const recipientId = conversation.participants.find(id => id !== user._id);
    const recipient = conversation.participantDetails?.find(p => p._id === recipientId);
    
    return recipient ? recipient.name : 'User';
  };
  
  const getConversationAvatar = (conversation) => {
    if (!conversation || !conversation.participants || !user) return null;
    
    const recipientId = conversation.participants.find(id => id !== user._id);
    const recipient = conversation.participantDetails?.find(p => p._id === recipientId);
    
    return recipient && recipient.profilePicture ? `/api/images/${recipient.profilePicture}` : undefined;
  };
  
  const getLastMessage = (conversation) => {
    if (!conversation || !conversation.lastMessage) return 'No messages yet';
    return conversation.lastMessage.content || 'Sent an image';
  };
  
  const getLastMessageTime = (conversation) => {
    if (!conversation || !conversation.lastMessage) return '';
    return formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true });
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
        maxWidth: 800, 
        borderLeft: `1px solid ${theme.palette.divider}`,
        borderRight: `1px solid ${theme.palette.divider}`,
        mx: 'auto',
        display: 'flex'
      }}>
        {/* Conversations List */}
        <Box sx={{ 
          width: isMobile && showConversation ? 0 : 300, 
          borderRight: `1px solid ${theme.palette.divider}`,
          display: isMobile && showConversation ? 'none' : 'block',
          flexShrink: 0
        }}>
          <Box sx={{ 
            p: 2, 
            position: 'sticky', 
            top: 0, 
            zIndex: 10, 
            backgroundColor: theme.palette.background.default,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}>
            <Typography variant="h6" fontWeight="bold">
              Messages
            </Typography>
          </Box>
          
          {isLoading && conversations.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : conversations.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No conversations yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%', p: 0 }}>
              {conversations.map((conversation) => (
                <React.Fragment key={conversation._id}>
                  <ListItem 
                    alignItems="flex-start"
                    sx={{ 
                      py: 2, 
                      px: 3, 
                      cursor: 'pointer',
                      backgroundColor: conversationId === conversation._id ? 'action.selected' : 'inherit',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => handleConversationClick(conversation._id)}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={getConversationAvatar(conversation)} 
                        alt={getConversationName(conversation)}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="body1"
                          component="span"
                          sx={{ fontWeight: conversation.unreadCount > 0 ? 'bold' : 'normal' }}
                        >
                          {getConversationName(conversation)}
                        </Typography>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography 
                            variant="body2" 
                            component="span"
                            sx={{ 
                              display: 'inline',
                              fontWeight: conversation.unreadCount > 0 ? 'bold' : 'normal'
                            }}
                          >
                            {getLastMessage(conversation)}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            component="span"
                            sx={{ 
                              display: 'block',
                              mt: 0.5
                            }}
                          >
                            {getLastMessageTime(conversation)}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                    {conversation.unreadCount > 0 && (
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: '50%', 
                          backgroundColor: 'primary.main',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          ml: 1
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'white' }}>
                          {conversation.unreadCount}
                        </Typography>
                      </Box>
                    )}
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
        
        {/* Conversation Messages */}
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          height: '100vh',
          display: (!isMobile || showConversation) ? 'flex' : 'none'
        }}>
          {currentConversation ? (
            <React.Fragment>
              {/* Conversation Header */}
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
                {isMobile && (
                  <IconButton onClick={handleBackToList} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                  </IconButton>
                )}
                
                <Avatar 
                  src={currentProfile?.profilePicture ? `/api/images/${currentProfile.profilePicture}` : undefined} 
                  alt={currentProfile?.name || 'User'}
                  sx={{ mr: 2 }}
                />
                <Typography variant="h6">
                  {currentProfile?.name || 'Conversation'}
                </Typography>
              </Box>
              
              {/* Messages */}
              <Box sx={{ 
                flexGrow: 1, 
                overflowY: 'auto', 
                p: 2,
                display: 'flex',
                flexDirection: 'column'
              }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : messages.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="text.secondary">
                      No messages yet. Start the conversation!
                    </Typography>
                  </Box>
                ) : (
                  messages.map((message) => {
                    const isCurrentUser = message.sender === user._id;
                    
                    return (
                      <Box 
                        key={message._id} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                          mb: 2,
                          position: 'relative'
                        }}
                      >
                        {!isCurrentUser && (
                          <Avatar 
                            src={currentProfile?.profilePicture ? `/api/images/${currentProfile.profilePicture}` : undefined} 
                            alt={currentProfile?.name || 'User'}
                            sx={{ width: 32, height: 32, mr: 1, mt: 0.5 }}
                          />
                        )}
                        
                        <Box sx={{ maxWidth: '70%' }}>
                          <Paper 
                            elevation={1} 
                            sx={{ 
                              p: 2, 
                              backgroundColor: isCurrentUser ? 'primary.main' : 'background.paper',
                              color: isCurrentUser ? 'white' : 'text.primary',
                              borderRadius: 2
                            }}
                          >
                            {message.content && (
                              <Typography variant="body1">
                                {message.content}
                              </Typography>
                            )}
                            
                            {message.image && (
                              <Box 
                                component="img" 
                                src={`/api/images/${message.image}`} 
                                alt="Message attachment" 
                                sx={{ 
                                  maxWidth: '100%', 
                                  maxHeight: 300, 
                                  borderRadius: 1,
                                  mt: message.content ? 1 : 0
                                }}
                              />
                            )}
                          </Paper>
                          
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ 
                              display: 'block',
                              mt: 0.5,
                              textAlign: isCurrentUser ? 'right' : 'left'
                            }}
                          >
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </Typography>
                        </Box>
                        
                        {isCurrentUser && (
                          <IconButton 
                            size="small" 
                            sx={{ 
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              opacity: 0.7,
                              '&:hover': { opacity: 1 }
                            }}
                            onClick={(e) => handleMenuOpen(e, message)}
                          >
                            <MoreIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    );
                  })
                )}
                <div ref={messageEndRef} />
              </Box>
              
              {/* Message Input */}
              <Box sx={{ 
                p: 2, 
                borderTop: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper
              }}>
                {imagePreview && (
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Box 
                      component="img" 
                      src={imagePreview} 
                      alt="Preview" 
                      sx={{ 
                        maxWidth: '100%', 
                        maxHeight: 200, 
                        borderRadius: 1 
                      }}
                    />
                    <IconButton 
                      size="small" 
                      sx={{ 
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
                      }}
                      onClick={handleRemoveImage}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                
                <form onSubmit={handleSendMessage}>
                  <TextField
                    fullWidth
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={handleMessageChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconButton onClick={handleImageClick}>
                            <ImageIcon />
                          </IconButton>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            type="submit"
                            disabled={!messageText.trim() && !messageImage}
                            color="primary"
                          >
                            <SendIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 30, py: 1 }
                    }}
                  />
                </form>
              </Box>
            </React.Fragment>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body1" color="text.secondary">
                Select a conversation to start messaging
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Message Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteMessage}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete message" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Messages;
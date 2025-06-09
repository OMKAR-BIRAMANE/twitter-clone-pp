import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  likeTweet, 
  unlikeTweet, 
  retweetTweet, 
  undoRetweet,
  deleteTweet
} from '../redux/features/tweetSlice';
import { 
  Box, 
  Typography, 
  Avatar, 
  IconButton, 
  Menu, 
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  ChatBubbleOutline as ReplyIcon,
  Repeat as RetweetIcon,
  Share as ShareIcon,
  MoreHoriz as MoreIcon,
  Delete as DeleteIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import TweetForm from './TweetForm';

const TweetItem = ({ tweet }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const { user } = useSelector((state) => state.auth);
  const isAuthor = user && tweet.author._id === user._id;
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteTweet(tweet._id)).unwrap();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete tweet:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleReplyClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setReplyDialogOpen(true);
  };
  
  const handleReplySuccess = () => {
    setReplyDialogOpen(false);
  };
  
  const handleLikeClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      if (tweet.isLiked) {
        await dispatch(unlikeTweet(tweet._id)).unwrap();
      } else {
        await dispatch(likeTweet(tweet._id)).unwrap();
      }
    } catch (error) {
      console.error('Failed to like/unlike tweet:', error);
    }
  };
  
  const handleRetweetClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      if (tweet.isRetweeted) {
        await dispatch(undoRetweet(tweet._id)).unwrap();
      } else {
        await dispatch(retweetTweet(tweet._id)).unwrap();
      }
    } catch (error) {
      console.error('Failed to retweet/undo retweet:', error);
    }
  };
  
  const handleTweetClick = (e) => {
    // Prevent navigation when clicking on interactive elements
    if (
      e.target.closest('button') ||
      e.target.closest('a') ||
      e.target.closest('.MuiMenu-root')
    ) {
      return;
    }
    
    navigate(`/tweet/${tweet._id}`);
  };
  
  // Format the tweet date
  const formattedDate = formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true });
  
  // Check if this is a retweet
  const isRetweet = tweet.isRetweet && tweet.parentTweet;
  const retweetedBy = isRetweet ? tweet.author : null;
  const actualTweet = isRetweet ? tweet.parentTweet : tweet;
  const actualAuthor = isRetweet ? actualTweet.author : tweet.author;
  
  // Check if this is a quote tweet
  const isQuote = tweet.isQuote && tweet.parentTweet;
  
  return (
    <Box 
      sx={{ 
        p: 2, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
          cursor: 'pointer'
        }
      }}
      onClick={handleTweetClick}
    >
      {/* Retweet indicator */}
      {isRetweet && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, ml: 7 }}>
          <RetweetIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            <Link 
              to={`/profile/${retweetedBy.username}`} 
              style={{ textDecoration: 'none', color: 'inherit' }}
              onClick={(e) => e.stopPropagation()}
            >
              {retweetedBy.name} Retweeted
            </Link>
          </Typography>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Avatar */}
        <Link 
          to={`/profile/${actualAuthor.username}`} 
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar 
            src={actualAuthor.profilePicture} 
            alt={actualAuthor.name}
            sx={{ width: 48, height: 48 }}
          />
        </Link>
        
        {/* Tweet content */}
        <Box sx={{ flexGrow: 1 }}>
          {/* Author info and date */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Link 
                to={`/profile/${actualAuthor.username}`} 
                style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={(e) => e.stopPropagation()}
              >
                <Typography variant="subtitle1" fontWeight="bold" component="span" sx={{ mr: 1 }}>
                  {actualAuthor.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ mr: 1 }}>
                  @{actualAuthor.username}
                </Typography>
              </Link>
              <Typography variant="body2" color="text.secondary" component="span">
                · {formattedDate}
              </Typography>
            </Box>
            
            {/* More options menu */}
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e);
              }}
            >
              <MoreIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={(e) => e.stopPropagation()}
            >
              {isAuthor && (
                <MenuItem onClick={handleDeleteClick}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  Delete
                </MenuItem>
              )}
              <MenuItem onClick={handleMenuClose}>
                <BookmarkBorderIcon fontSize="small" sx={{ mr: 1 }} />
                Bookmark
              </MenuItem>
            </Menu>
          </Box>
          
          {/* Tweet text */}
          <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
            {actualTweet.content}
          </Typography>
          
          {/* Tweet media */}
          {actualTweet.media && actualTweet.media.length > 0 && (
            <Box 
              sx={{ 
                mt: 1, 
                mb: 2,
                display: 'grid', 
                gridTemplateColumns: actualTweet.media.length === 1 ? '1fr' : 
                                    actualTweet.media.length === 2 ? '1fr 1fr' : 
                                    actualTweet.media.length >= 3 ? '1fr 1fr' : '',
                gridTemplateRows: actualTweet.media.length <= 2 ? '1fr' : 
                                  actualTweet.media.length >= 3 ? '1fr 1fr' : '',
                gap: 1,
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              {actualTweet.media.map((media, index) => (
                <Box 
                  key={index} 
                  component="img" 
                  src={`/api/images/${media}`} 
                  alt={`Tweet media ${index + 1}`}
                  sx={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    borderRadius: 2,
                    maxHeight: actualTweet.media.length === 1 ? 400 : 200
                  }}
                />
              ))}
            </Box>
          )}
          
          {/* Quoted tweet */}
          {isQuote && (
            <Box 
              sx={{ 
                mt: 1, 
                mb: 2, 
                p: 2, 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tweet/${tweet.parentTweet._id}`);
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar 
                  src={tweet.parentTweet.author.profilePicture} 
                  alt={tweet.parentTweet.author.name}
                  sx={{ width: 20, height: 20, mr: 1 }}
                />
                <Typography variant="subtitle2" component="span">
                  {tweet.parentTweet.author.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  @{tweet.parentTweet.author.username}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {tweet.parentTweet.content}
              </Typography>
              {tweet.parentTweet.media && tweet.parentTweet.media.length > 0 && (
                <Box 
                  component="img" 
                  src={`/api/images/${tweet.parentTweet.media[0]}`} 
                  alt="Quoted tweet media"
                  sx={{ 
                    width: '100%', 
                    maxHeight: 150, 
                    objectFit: 'cover',
                    borderRadius: 1
                  }}
                />
              )}
            </Box>
          )}
          
          {/* Tweet actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            {/* Reply */}
            <Tooltip title="Reply">
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReplyClick();
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ReplyIcon fontSize="small" />
                  {actualTweet.replyCount > 0 && (
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      {actualTweet.replyCount}
                    </Typography>
                  )}
                </Box>
              </IconButton>
            </Tooltip>
            
            {/* Retweet */}
            <Tooltip title={actualTweet.isRetweeted ? "Undo Retweet" : "Retweet"}>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetweetClick();
                }}
                color={actualTweet.isRetweeted ? "primary" : "default"}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <RetweetIcon fontSize="small" />
                  {actualTweet.retweetCount > 0 && (
                    <Typography 
                      variant="body2" 
                      sx={{ ml: 0.5 }}
                      color={actualTweet.isRetweeted ? "primary" : "inherit"}
                    >
                      {actualTweet.retweetCount}
                    </Typography>
                  )}
                </Box>
              </IconButton>
            </Tooltip>
            
            {/* Like */}
            <Tooltip title={actualTweet.isLiked ? "Unlike" : "Like"}>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLikeClick();
                }}
                color={actualTweet.isLiked ? "error" : "default"}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {actualTweet.isLiked ? (
                    <FavoriteIcon fontSize="small" />
                  ) : (
                    <FavoriteBorderIcon fontSize="small" />
                  )}
                  {actualTweet.likeCount > 0 && (
                    <Typography 
                      variant="body2" 
                      sx={{ ml: 0.5 }}
                      color={actualTweet.isLiked ? "error" : "inherit"}
                    >
                      {actualTweet.likeCount}
                    </Typography>
                  )}
                </Box>
              </IconButton>
            </Tooltip>
            
            {/* Share */}
            <Tooltip title="Share">
              <IconButton 
                size="small" 
                onClick={(e) => e.stopPropagation()}
              >
                <ShareIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Delete Tweet</DialogTitle>
        <DialogContent>
          <Typography>This can't be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reply dialog */}
      <Dialog
        open={replyDialogOpen}
        onClose={() => setReplyDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar 
                src={actualAuthor.profilePicture} 
                alt={actualAuthor.name}
                sx={{ width: 48, height: 48 }}
              />
              
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="bold" component="span" sx={{ mr: 1 }}>
                    {actualAuthor.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="span">
                    @{actualAuthor.username}
                  </Typography>
                </Box>
                
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {actualTweet.content}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <TweetForm 
            parentId={actualTweet._id} 
            onSuccess={handleReplySuccess} 
            placeholder="Tweet your reply"
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TweetItem;
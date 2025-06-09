import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTweet } from '../redux/features/tweetSlice';
import { 
  Box, 
  Button, 
  TextField, 
  Avatar, 
  IconButton, 
  CircularProgress,
  Typography,
  Divider,
  Tooltip,
  Badge
} from '@mui/material';
import { 
  Image as ImageIcon, 
  GifBox as GifIcon, 
  Poll as PollIcon, 
  EmojiEmotions as EmojiIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const TweetForm = ({ parentId = null, isQuote = false, onSuccess = null, placeholder = "What's happening?" }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  
  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (error) setError('');
  };
  
  const handleMediaClick = () => {
    fileInputRef.current.click();
  };
  
  const handleMediaChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length + media.length > 4) {
      setError('You can only upload up to 4 images');
      return;
    }
    
    setMedia([...media, ...selectedFiles]);
    
    // Create preview URLs
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setMediaPreview([...mediaPreview, ...newPreviews]);
  };
  
  const removeMedia = (index) => {
    const newMedia = [...media];
    const newPreviews = [...mediaPreview];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
    newMedia.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setMedia(newMedia);
    setMediaPreview(newPreviews);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && media.length === 0) {
      setError('Tweet cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const tweetData = {
        content: content.trim(),
        media
      };
      
      if (parentId) {
        tweetData.parentId = parentId;
      }
      
      if (isQuote) {
        tweetData.isQuote = true;
      }
      
      await dispatch(createTweet(tweetData)).unwrap();
      
      // Reset form
      setContent('');
      setMedia([]);
      setMediaPreview([]);
      setError('');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError(error || 'Failed to create tweet');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Avatar 
          src={user?.profilePicture} 
          alt={user?.name}
          sx={{ width: 48, height: 48 }}
        />
        
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            fullWidth
            multiline
            placeholder={placeholder}
            value={content}
            onChange={handleContentChange}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: '1.1rem', minHeight: 60 }
            }}
            error={!!error}
            helperText={error}
          />
          
          {mediaPreview.length > 0 && (
            <Box 
              sx={{ 
                mt: 2, 
                display: 'grid', 
                gridTemplateColumns: mediaPreview.length === 1 ? '1fr' : 
                                    mediaPreview.length === 2 ? '1fr 1fr' : 
                                    mediaPreview.length >= 3 ? '1fr 1fr' : '',
                gridTemplateRows: mediaPreview.length <= 2 ? '1fr' : 
                                  mediaPreview.length >= 3 ? '1fr 1fr' : '',
                gap: 1,
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {mediaPreview.map((preview, index) => (
                <Box key={index} sx={{ position: 'relative', paddingTop: '56.25%' }}>
                  <Box 
                    component="img" 
                    src={preview} 
                    alt={`Media preview ${index + 1}`}
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 2
                    }}
                  />
                  <IconButton 
                    size="small"
                    onClick={() => removeMedia(index)}
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)'
                      }
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex' }}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleMediaChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
              
              <Tooltip title="Media">
                <IconButton color="primary" onClick={handleMediaClick}>
                  <Badge badgeContent={media.length} color="primary" invisible={media.length === 0}>
                    <ImageIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Tooltip title="GIF">
                <IconButton color="primary">
                  <GifIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Poll">
                <IconButton color="primary">
                  <PollIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Emoji">
                <IconButton color="primary">
                  <EmojiIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Schedule">
                <IconButton color="primary">
                  <ScheduleIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Location">
                <IconButton color="primary">
                  <LocationIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isSubmitting || (!content.trim() && media.length === 0)}
              sx={{ 
                borderRadius: '30px', 
                px: 3,
                textTransform: 'none',
                fontWeight: 'bold'
              }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Tweet'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TweetForm;
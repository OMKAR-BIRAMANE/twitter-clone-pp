import React from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import TweetItem from './TweetItem';
import InfiniteScroll from 'react-infinite-scroll-component';

const TweetList = ({ tweets, hasMore, loadMore, loading, emptyMessage }) => {
  if (!tweets || tweets.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage || 'No tweets to display'}
        </Typography>
      </Box>
    );
  }

  return (
    <InfiniteScroll
      dataLength={tweets.length}
      next={loadMore}
      hasMore={hasMore}
      loader={
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={30} />
        </Box>
      }
      endMessage={
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            You've seen all tweets
          </Typography>
        </Box>
      }
      scrollThreshold={0.9}
    >
      {tweets.map((tweet) => (
        <TweetItem key={tweet._id} tweet={tweet} />
      ))}
      
      {!hasMore && tweets.length > 10 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            sx={{ borderRadius: 30 }}
          >
            Back to top
          </Button>
        </Box>
      )}
    </InfiniteScroll>
  );
};

export default TweetList;
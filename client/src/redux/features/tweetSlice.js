import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import tweetService from '../../services/tweetService';

const initialState = {
  tweets: [],
  timelineTweets: [],
  currentTweet: null,
  hashtagTweets: [],
  bookmarks: [],
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Create a tweet
export const createTweet = createAsyncThunk(
  'tweet/createTweet',
  async (tweetData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await tweetService.createTweet(tweetData, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get tweet by ID
export const getTweetById = createAsyncThunk(
  'tweet/getTweetById',
  async (id, thunkAPI) => {
    try {
      return await tweetService.getTweetById(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get timeline tweets
export const getTimelineTweets = createAsyncThunk(
  'tweet/getTimelineTweets',
  async (page = 1, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await tweetService.getTimelineTweets(page, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user tweets
export const getUserTweets = createAsyncThunk(
  'tweet/getUserTweets',
  async ({ username, page = 1 }, thunkAPI) => {
    try {
      return await tweetService.getUserTweets(username, page);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Like a tweet
export const likeTweet = createAsyncThunk(
  'tweet/likeTweet',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const userId = thunkAPI.getState().auth.user._id;
      await tweetService.likeTweet(id, token);
      return { id, userId };
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Unlike a tweet
export const unlikeTweet = createAsyncThunk(
  'tweet/unlikeTweet',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const userId = thunkAPI.getState().auth.user._id;
      await tweetService.unlikeTweet(id, token);
      return { id, userId };
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Retweet a tweet
export const retweetTweet = createAsyncThunk(
  'tweet/retweetTweet',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const userId = thunkAPI.getState().auth.user._id;
      const result = await tweetService.retweetTweet(id, token);
      return { id, userId, retweetId: result.retweetId };
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Undo retweet
export const undoRetweet = createAsyncThunk(
  'tweet/undoRetweet',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const userId = thunkAPI.getState().auth.user._id;
      await tweetService.undoRetweet(id, token);
      return { id, userId };
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete a tweet
export const deleteTweet = createAsyncThunk(
  'tweet/deleteTweet',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await tweetService.deleteTweet(id, token);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get tweets by hashtag
export const getTweetsByHashtag = createAsyncThunk(
  'tweet/getTweetsByHashtag',
  async ({ hashtag, page = 1 }, thunkAPI) => {
    try {
      return await tweetService.getTweetsByHashtag(hashtag, page);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get tweet replies
export const getReplies = createAsyncThunk(
  'tweet/getReplies',
  async ({ tweetId, page = 1, limit = 10 }, thunkAPI) => {
    try {
      return await tweetService.getTweetReplies(tweetId, page, limit);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get bookmarked tweets
export const getBookmarks = createAsyncThunk(
  'tweet/getBookmarks',
  async ({ page = 1, limit = 10 }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await tweetService.getBookmarkedTweets(page, limit);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Clear all bookmarks
export const clearBookmarks = createAsyncThunk(
  'tweet/clearBookmarks',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      // This is a placeholder - you may need to implement this endpoint in your backend
      // For now, we'll just return an empty array
      return [];
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const tweetSlice = createSlice({
  name: 'tweet',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentTweet: (state) => {
      state.currentTweet = null;
    },
    clearTweets: (state) => {
      state.tweets = [];
      state.currentPage = 1;
    },
    addNewTweet: (state, action) => {
      // Add new tweet from socket to timeline
      state.timelineTweets.data = [action.payload, ...state.timelineTweets.data];
    },
    updateTweetInState: (state, action) => {
      // Update tweet in all lists when it changes via socket
      const updatedTweet = action.payload;
      
      // Update in timeline
      if (state.timelineTweets.data) {
        state.timelineTweets.data = state.timelineTweets.data.map(tweet => 
          tweet._id === updatedTweet._id ? updatedTweet : tweet
        );
      }
      
      // Update in user tweets
      if (state.tweets.data) {
        state.tweets.data = state.tweets.data.map(tweet => 
          tweet._id === updatedTweet._id ? updatedTweet : tweet
        );
      }
      
      // Update in hashtag tweets
      if (state.hashtagTweets.data) {
        state.hashtagTweets.data = state.hashtagTweets.data.map(tweet => 
          tweet._id === updatedTweet._id ? updatedTweet : tweet
        );
      }
      
      // Update current tweet if it's the same
      if (state.currentTweet && state.currentTweet._id === updatedTweet._id) {
        state.currentTweet = updatedTweet;
      }
    },
    removeTweetFromState: (state, action) => {
      // Remove tweet from all lists when it's deleted via socket
      const tweetId = action.payload;
      
      // Remove from timeline
      if (state.timelineTweets.data) {
        state.timelineTweets.data = state.timelineTweets.data.filter(tweet => 
          tweet._id !== tweetId
        );
      }
      
      // Remove from user tweets
      if (state.tweets.data) {
        state.tweets.data = state.tweets.data.filter(tweet => 
          tweet._id !== tweetId
        );
      }
      
      // Remove from hashtag tweets
      if (state.hashtagTweets.data) {
        state.hashtagTweets.data = state.hashtagTweets.data.filter(tweet => 
          tweet._id !== tweetId
        );
      }
      
      // Clear current tweet if it's the same
      if (state.currentTweet && state.currentTweet._id === tweetId) {
        state.currentTweet = null;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Create tweet cases
      .addCase(createTweet.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTweet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Add to timeline if it exists
        if (state.timelineTweets.data) {
          state.timelineTweets.data = [action.payload, ...state.timelineTweets.data];
        }
        // Add to user tweets if viewing the same user's tweets
        if (state.tweets.data && action.payload.author._id === state.tweets.author) {
          state.tweets.data = [action.payload, ...state.tweets.data];
        }
      })
      .addCase(createTweet.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get tweet by ID cases
      .addCase(getTweetById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTweetById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentTweet = action.payload;
      })
      .addCase(getTweetById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get timeline tweets cases
      .addCase(getTimelineTweets.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTimelineTweets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.timelineTweets = action.payload;
      })
      .addCase(getTimelineTweets.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get user tweets cases
      .addCase(getUserTweets.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserTweets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tweets = action.payload;
      })
      .addCase(getUserTweets.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Like tweet cases
      .addCase(likeTweet.fulfilled, (state, action) => {
        const { id, userId } = action.payload;
        
        // Update in timeline
        if (state.timelineTweets.data) {
          state.timelineTweets.data = state.timelineTweets.data.map(tweet => 
            tweet._id === id ? { ...tweet, likes: [...tweet.likes, userId] } : tweet
          );
        }
        
        // Update in user tweets
        if (state.tweets.data) {
          state.tweets.data = state.tweets.data.map(tweet => 
            tweet._id === id ? { ...tweet, likes: [...tweet.likes, userId] } : tweet
          );
        }
        
        // Update in hashtag tweets
        if (state.hashtagTweets.data) {
          state.hashtagTweets.data = state.hashtagTweets.data.map(tweet => 
            tweet._id === id ? { ...tweet, likes: [...tweet.likes, userId] } : tweet
          );
        }
        
        // Update current tweet if it's the same
        if (state.currentTweet && state.currentTweet._id === id) {
          state.currentTweet = {
            ...state.currentTweet,
            likes: [...state.currentTweet.likes, userId]
          };
        }
      })
      // Unlike tweet cases
      .addCase(unlikeTweet.fulfilled, (state, action) => {
        const { id, userId } = action.payload;
        
        // Update in timeline
        if (state.timelineTweets.data) {
          state.timelineTweets.data = state.timelineTweets.data.map(tweet => 
            tweet._id === id ? 
              { ...tweet, likes: tweet.likes.filter(like => like !== userId) } : 
              tweet
          );
        }
        
        // Update in user tweets
        if (state.tweets.data) {
          state.tweets.data = state.tweets.data.map(tweet => 
            tweet._id === id ? 
              { ...tweet, likes: tweet.likes.filter(like => like !== userId) } : 
              tweet
          );
        }
        
        // Update in hashtag tweets
        if (state.hashtagTweets.data) {
          state.hashtagTweets.data = state.hashtagTweets.data.map(tweet => 
            tweet._id === id ? 
              { ...tweet, likes: tweet.likes.filter(like => like !== userId) } : 
              tweet
          );
        }
        
        // Update current tweet if it's the same
        if (state.currentTweet && state.currentTweet._id === id) {
          state.currentTweet = {
            ...state.currentTweet,
            likes: state.currentTweet.likes.filter(like => like !== userId)
          };
        }
      })
      // Retweet tweet cases
      .addCase(retweetTweet.fulfilled, (state, action) => {
        const { id, userId } = action.payload;
        
        // Update in timeline
        if (state.timelineTweets.data) {
          state.timelineTweets.data = state.timelineTweets.data.map(tweet => 
            tweet._id === id ? { ...tweet, retweets: [...tweet.retweets, userId] } : tweet
          );
        }
        
        // Update in user tweets
        if (state.tweets.data) {
          state.tweets.data = state.tweets.data.map(tweet => 
            tweet._id === id ? { ...tweet, retweets: [...tweet.retweets, userId] } : tweet
          );
        }
        
        // Update in hashtag tweets
        if (state.hashtagTweets.data) {
          state.hashtagTweets.data = state.hashtagTweets.data.map(tweet => 
            tweet._id === id ? { ...tweet, retweets: [...tweet.retweets, userId] } : tweet
          );
        }
        
        // Update current tweet if it's the same
        if (state.currentTweet && state.currentTweet._id === id) {
          state.currentTweet = {
            ...state.currentTweet,
            retweets: [...state.currentTweet.retweets, userId]
          };
        }
      })
      // Undo retweet cases
      .addCase(undoRetweet.fulfilled, (state, action) => {
        const { id, userId } = action.payload;
        
        // Update in timeline
        if (state.timelineTweets.data) {
          state.timelineTweets.data = state.timelineTweets.data.map(tweet => 
            tweet._id === id ? 
              { ...tweet, retweets: tweet.retweets.filter(retweet => retweet !== userId) } : 
              tweet
          );
        }
        
        // Update in user tweets
        if (state.tweets.data) {
          state.tweets.data = state.tweets.data.map(tweet => 
            tweet._id === id ? 
              { ...tweet, retweets: tweet.retweets.filter(retweet => retweet !== userId) } : 
              tweet
          );
        }
        
        // Update in hashtag tweets
        if (state.hashtagTweets.data) {
          state.hashtagTweets.data = state.hashtagTweets.data.map(tweet => 
            tweet._id === id ? 
              { ...tweet, retweets: tweet.retweets.filter(retweet => retweet !== userId) } : 
              tweet
          );
        }
        
        // Update current tweet if it's the same
        if (state.currentTweet && state.currentTweet._id === id) {
          state.currentTweet = {
            ...state.currentTweet,
            retweets: state.currentTweet.retweets.filter(retweet => retweet !== userId)
          };
        }
      })
      // Delete tweet cases
      .addCase(deleteTweet.fulfilled, (state, action) => {
        const id = action.payload;
        
        // Remove from timeline
        if (state.timelineTweets.data) {
          state.timelineTweets.data = state.timelineTweets.data.filter(tweet => 
            tweet._id !== id
          );
        }
        
        // Remove from user tweets
        if (state.tweets.data) {
          state.tweets.data = state.tweets.data.filter(tweet => 
            tweet._id !== id
          );
        }
        
        // Remove from hashtag tweets
        if (state.hashtagTweets.data) {
          state.hashtagTweets.data = state.hashtagTweets.data.filter(tweet => 
            tweet._id !== id
          );
        }
        
        // Clear current tweet if it's the same
        if (state.currentTweet && state.currentTweet._id === id) {
          state.currentTweet = null;
        }
      })
      // Get tweets by hashtag cases
      .addCase(getTweetsByHashtag.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTweetsByHashtag.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.hashtagTweets = action.payload;
      })
      .addCase(getTweetsByHashtag.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get tweet replies cases
      .addCase(getReplies.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReplies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (state.currentTweet) {
          state.currentTweet.replies = action.payload;
        }
      })
      .addCase(getReplies.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get bookmarks cases
      .addCase(getBookmarks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBookmarks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.bookmarks = action.payload;
      })
      .addCase(getBookmarks.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Clear bookmarks cases
      .addCase(clearBookmarks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clearBookmarks.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.bookmarks = { data: [] };
      })
      .addCase(clearBookmarks.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { 
  reset, 
  clearCurrentTweet, 
  clearTweets, 
  addNewTweet, 
  updateTweetInState, 
  removeTweetFromState 
} = tweetSlice.actions;
export default tweetSlice.reducer;
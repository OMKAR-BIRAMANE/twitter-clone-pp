import axios from 'axios';

const API_URL = '/api/tweets';

// Create a new tweet
const createTweet = async (tweetData) => {
  const formData = new FormData();
  
  // Append text content
  formData.append('content', tweetData.content);
  
  // Append parent tweet ID if it's a reply or quote
  if (tweetData.parentId) {
    formData.append('parentId', tweetData.parentId);
  }
  
  // Append isRetweet flag if it's a retweet
  if (tweetData.isRetweet) {
    formData.append('isRetweet', tweetData.isRetweet);
  }
  
  // Append isQuote flag if it's a quote
  if (tweetData.isQuote) {
    formData.append('isQuote', tweetData.isQuote);
  }
  
  // Append media files if they exist
  if (tweetData.media && tweetData.media.length > 0) {
    for (let i = 0; i < tweetData.media.length; i++) {
      formData.append('media', tweetData.media[i]);
    }
  }
  
  const response = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// Get a tweet by ID
const getTweetById = async (tweetId) => {
  const response = await axios.get(`${API_URL}/${tweetId}`);
  return response.data;
};

// Get tweets by user ID
const getTweetsByUser = async (userId, page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}/user/${userId}?page=${page}&limit=${limit}`);
  return response.data;
};

// Get timeline tweets
const getTimelineTweets = async (page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}/timeline?page=${page}&limit=${limit}`);
  return response.data;
};

// Like a tweet
const likeTweet = async (tweetId) => {
  const response = await axios.post(`${API_URL}/${tweetId}/like`);
  return response.data;
};

// Unlike a tweet
const unlikeTweet = async (tweetId) => {
  const response = await axios.post(`${API_URL}/${tweetId}/unlike`);
  return response.data;
};

// Retweet a tweet
const retweetTweet = async (tweetId) => {
  const response = await axios.post(`${API_URL}/${tweetId}/retweet`);
  return response.data;
};

// Undo retweet
const undoRetweet = async (tweetId) => {
  const response = await axios.post(`${API_URL}/${tweetId}/undo-retweet`);
  return response.data;
};

// Delete a tweet
const deleteTweet = async (tweetId) => {
  const response = await axios.delete(`${API_URL}/${tweetId}`);
  return response.data;
};

// Get tweets by hashtag
const getTweetsByHashtag = async (hashtag, page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}/hashtag/${hashtag}?page=${page}&limit=${limit}`);
  return response.data;
};

// Get tweet replies
const getTweetReplies = async (tweetId, page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}/${tweetId}/replies?page=${page}&limit=${limit}`);
  return response.data;
};

// Get bookmarked tweets
const getBookmarkedTweets = async (page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}/bookmarks?page=${page}&limit=${limit}`);
  return response.data;
};

// Bookmark a tweet
const bookmarkTweet = async (tweetId) => {
  const response = await axios.post(`${API_URL}/${tweetId}/bookmark`);
  return response.data;
};

// Remove bookmark
const removeBookmark = async (tweetId) => {
  const response = await axios.post(`${API_URL}/${tweetId}/remove-bookmark`);
  return response.data;
};

const tweetService = {
  createTweet,
  getTweetById,
  getTweetsByUser,
  getTimelineTweets,
  likeTweet,
  unlikeTweet,
  retweetTweet,
  undoRetweet,
  deleteTweet,
  getTweetsByHashtag,
  getTweetReplies,
  getBookmarkedTweets,
  bookmarkTweet,
  removeBookmark
};

export default tweetService;
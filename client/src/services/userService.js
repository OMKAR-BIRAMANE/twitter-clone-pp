import axios from 'axios';

const API_URL = '/api/users';

// Get user profile by username
const getUserByUsername = async (username) => {
  const response = await axios.get(`${API_URL}/username/${username}`);
  return response.data;
};

// Get user profile by ID
const getUserById = async (userId) => {
  const response = await axios.get(`${API_URL}/${userId}`);
  return response.data;
};

// Get all users with pagination and search
const getAllUsers = async (page = 1, limit = 10, search = '') => {
  const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}&search=${search}`);
  return response.data;
};

// Follow a user
const followUser = async (userId) => {
  const response = await axios.post(`${API_URL}/follow/${userId}`);
  return response.data;
};

// Unfollow a user
const unfollowUser = async (userId) => {
  const response = await axios.post(`${API_URL}/unfollow/${userId}`);
  return response.data;
};

// Update user profile
const updateProfile = async (userData) => {
  const formData = new FormData();
  
  // Append text fields
  if (userData.name) formData.append('name', userData.name);
  if (userData.bio) formData.append('bio', userData.bio);
  if (userData.location) formData.append('location', userData.location);
  if (userData.website) formData.append('website', userData.website);
  
  // Append files if they exist
  if (userData.profilePicture) formData.append('profilePicture', userData.profilePicture);
  if (userData.coverPicture) formData.append('coverPicture', userData.coverPicture);
  
  const response = await axios.put(`${API_URL}/profile`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  // Update local storage with new user data
  if (response.data) {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const updatedUser = { ...currentUser, ...response.data.user };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
  
  return response.data;
};

// Get user followers
const getUserFollowers = async (userId, page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}/${userId}/followers?page=${page}&limit=${limit}`);
  return response.data;
};

// Get user following
const getUserFollowing = async (userId, page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}/${userId}/following?page=${page}&limit=${limit}`);
  return response.data;
};

const userService = {
  getUserByUsername,
  getUserById,
  getAllUsers,
  followUser,
  unfollowUser,
  updateProfile,
  getUserFollowers,
  getUserFollowing
};

export default userService;
import axios from 'axios';

const API_URL = '/api/messages';

// Send a message
const sendMessage = async (formData) => {
  const response = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Get conversation between two users
const getConversation = async (userId, page = 1, limit = 20) => {
  const response = await axios.get(`${API_URL}/conversation/${userId}?page=${page}&limit=${limit}`);
  return response.data;
};

// Get all conversations for a user
const getAllConversations = async () => {
  const response = await axios.get(`${API_URL}/conversations`);
  return response.data;
};

// Delete a message
const deleteMessage = async (messageId) => {
  const response = await axios.delete(`${API_URL}/${messageId}`);
  return response.data;
};

// Get unread message count
const getUnreadCount = async () => {
  const response = await axios.get(`${API_URL}/unread-count`);
  return response.data;
};

const messageService = {
  sendMessage,
  getConversation,
  getAllConversations,
  deleteMessage,
  getUnreadCount
};

export default messageService;
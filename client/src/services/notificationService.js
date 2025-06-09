import axios from 'axios';

const API_URL = '/api/notifications';

// Get user notifications with pagination
const getNotifications = async (page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`);
  return response.data;
};

// Mark a notification as read
const markAsRead = async (notificationId) => {
  const response = await axios.put(`${API_URL}/${notificationId}/read`);
  return response.data;
};

// Mark all notifications as read
const markAllAsRead = async () => {
  const response = await axios.put(`${API_URL}/read-all`);
  return response.data;
};

// Delete a notification
const deleteNotification = async (notificationId) => {
  const response = await axios.delete(`${API_URL}/${notificationId}`);
  return response.data;
};

// Delete all notifications
const deleteAllNotifications = async () => {
  const response = await axios.delete(`${API_URL}/delete-all`);
  return response.data;
};

// Get unread notification count
const getUnreadCount = async () => {
  const response = await axios.get(`${API_URL}/unread-count`);
  return response.data;
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount
};

export default notificationService;
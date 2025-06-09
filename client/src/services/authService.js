import axios from 'axios';

const API_URL = '/api/auth';

// Register user
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/signup`, userData);
  
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
  }
  
  return response.data;
};

// Login user
const login = async (userData) => {
  // Map the usernameOrEmail field to username for the API
  const loginData = {
    username: userData.usernameOrEmail,
    password: userData.password
  };
  
  console.log('Sending login request with data:', loginData);
  
  try {
    const response = await axios.post(`${API_URL}/login`, loginData);
    console.log('Login response:', response.data);
    
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

// Logout user
const logout = async () => {
  try {
    await axios.post(`${API_URL}/logout`);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Refresh token
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    return null;
  }
  
  try {
    const response = await axios.post(`${API_URL}/refresh-token`, { token: refreshToken });
    
    if (response.data) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    
    return response.data;
  } catch (error) {
    console.error('Token refresh error:', error);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

// Setup axios interceptors for token handling
const setupAxiosInterceptors = () => {
  // Request interceptor to add token to headers
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Response interceptor to handle token refresh on 401 errors
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If error is 401 and we haven't tried to refresh the token yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshResponse = await refreshToken();
          if (refreshResponse) {
            // Retry the original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.accessToken}`;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};

// Initialize interceptors
setupAxiosInterceptors();

const authService = {
  register,
  login,
  logout,
  refreshToken
};

export default authService;
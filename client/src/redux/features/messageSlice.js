import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import messageService from '../../services/messageService';

// Initial state
const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Send a message
export const sendMessage = createAsyncThunk(
  'messages/send',
  async ({ receiverId, content, media }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append('receiverId', receiverId);
      formData.append('content', content);
      
      if (media) {
        formData.append('media', media);
      }
      
      return await messageService.sendMessage(formData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to send message';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get conversation between two users
export const getConversation = createAsyncThunk(
  'messages/getConversation',
  async ({ userId, page = 1, limit = 20 }, thunkAPI) => {
    try {
      return await messageService.getConversation(userId, page, limit);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to get conversation';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all conversations for a user
export const getAllConversations = createAsyncThunk(
  'messages/getAllConversations',
  async (_, thunkAPI) => {
    try {
      return await messageService.getAllConversations();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to get conversations';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete a message
export const deleteMessage = createAsyncThunk(
  'messages/delete',
  async (messageId, thunkAPI) => {
    try {
      await messageService.deleteMessage(messageId);
      return messageId;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete message';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get unread message count
export const getUnreadCount = createAsyncThunk(
  'messages/unreadCount',
  async (_, thunkAPI) => {
    try {
      return await messageService.getUnreadCount();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to get unread count';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    addNewMessage: (state, action) => {
      // Handle new message received via socket
      const newMessage = action.payload;
      
      // Add to current conversation if it matches
      if (state.currentConversation && 
          (newMessage.sender._id === state.currentConversation._id || 
           newMessage.receiver._id === state.currentConversation._id)) {
        state.messages.unshift(newMessage);
      }
      
      // Update conversations list
      const conversationIndex = state.conversations.findIndex(
        conv => conv.user._id === newMessage.sender._id || conv.user._id === newMessage.receiver._id
      );
      
      if (conversationIndex !== -1) {
        // Update existing conversation
        const updatedConversation = {
          ...state.conversations[conversationIndex],
          lastMessage: newMessage,
          unreadCount: state.currentConversation && 
                      state.currentConversation._id === newMessage.sender._id ? 
                      0 : state.conversations[conversationIndex].unreadCount + 1
        };
        
        // Remove from current position
        state.conversations.splice(conversationIndex, 1);
        // Add to the beginning
        state.conversations.unshift(updatedConversation);
      } else {
        // Create new conversation entry
        const otherUser = newMessage.sender._id === state.user?._id ? newMessage.receiver : newMessage.sender;
        state.conversations.unshift({
          user: otherUser,
          lastMessage: newMessage,
          unreadCount: 1
        });
      }
      
      // Update total unread count
      if (newMessage.sender._id !== state.user?._id && 
          (!state.currentConversation || state.currentConversation._id !== newMessage.sender._id)) {
        state.unreadCount += 1;
      }
    },
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.messages.unshift(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get Conversation
      .addCase(getConversation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentConversation = action.payload.user;
        
        // If it's the first page, replace messages, otherwise append
        if (action.meta.arg.page === 1) {
          state.messages = action.payload.messages;
        } else {
          state.messages = [...state.messages, ...action.payload.messages];
        }
        
        // Reset unread count for this conversation
        const conversationIndex = state.conversations.findIndex(
          conv => conv.user._id === action.payload.user._id
        );
        
        if (conversationIndex !== -1) {
          state.unreadCount -= state.conversations[conversationIndex].unreadCount;
          state.conversations[conversationIndex].unreadCount = 0;
        }
      })
      .addCase(getConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get All Conversations
      .addCase(getAllConversations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.conversations = action.payload.conversations;
        state.unreadCount = action.payload.totalUnreadCount;
      })
      .addCase(getAllConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete Message
      .addCase(deleteMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.messages = state.messages.filter(message => message._id !== action.payload);
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get Unread Count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count;
      });
  }
});

export const { reset, clearCurrentConversation, addNewMessage, updateUnreadCount } = messageSlice.actions;
export default messageSlice.reducer;
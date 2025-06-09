// Socket.io event handlers

export const setupSocketEvents = (io) => {
  // Track online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User connects with their ID
    socket.on('user-connected', (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log('User connected:', userId);
      
      // Broadcast online users to all clients
      io.emit('online-users', Array.from(onlineUsers.keys()));
    });

    // New tweet event
    socket.on('new-tweet', (tweetData) => {
      console.log('New tweet received:', tweetData);
      
      // Broadcast to all connected clients
      socket.broadcast.emit('tweet-received', tweetData);
    });

    // Like tweet event
    socket.on('like-tweet', ({ tweetId, userId, authorId }) => {
      console.log(`User ${userId} liked tweet ${tweetId}`);
      
      // Notify tweet author if they're online
      const authorSocketId = onlineUsers.get(authorId);
      if (authorSocketId) {
        io.to(authorSocketId).emit('notification', {
          type: 'like',
          tweetId,
          userId
        });
      }
    });

    // Retweet event
    socket.on('retweet', ({ tweetId, userId, authorId }) => {
      console.log(`User ${userId} retweeted tweet ${tweetId}`);
      
      // Notify tweet author if they're online
      const authorSocketId = onlineUsers.get(authorId);
      if (authorSocketId) {
        io.to(authorSocketId).emit('notification', {
          type: 'retweet',
          tweetId,
          userId
        });
      }
    });

    // Follow user event
    socket.on('follow-user', ({ followerId, followedId }) => {
      console.log(`User ${followerId} followed user ${followedId}`);
      
      // Notify followed user if they're online
      const followedSocketId = onlineUsers.get(followedId);
      if (followedSocketId) {
        io.to(followedSocketId).emit('notification', {
          type: 'follow',
          userId: followerId
        });
      }
    });

    // Direct message event
    socket.on('direct-message', ({ message, senderId, receiverId }) => {
      console.log(`Message from ${senderId} to ${receiverId}`);
      
      // Send to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message-received', {
          message,
          senderId
        });
      }
    });

    // Disconnect event
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Remove user from online users
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log('User disconnected:', userId);
          break;
        }
      }
      
      // Broadcast updated online users
      io.emit('online-users', Array.from(onlineUsers.keys()));
    });
  });
};
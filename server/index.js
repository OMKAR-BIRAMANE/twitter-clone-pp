import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth-routes.js';
import userRoutes from './routes/user-routes.js';
import tweetRoutes from './routes/tweet-routes.js';
import notificationRoutes from './routes/notification-routes.js';
import messageRoutes from './routes/message-routes.js';
import imageRoutes from './routes/image-routes.js';

// Import utilities
import Connection from './database/db.js';
import { setupSocketEvents } from './utils/socket.js';
import connectGridFS from './controllers/image-controller.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tweets', tweetRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/images', imageRoutes);

// Default route
app.get('/', (req, res) => {
    res.send('Twitter Clone API is running');
});

// Connect to MongoDB
Connection();

// Initialize Socket.io event handlers
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    
    // Initialize GridFS
    connectGridFS(mongoose.connection.db);
    
    // Initialize Socket.io
    setupSocketEvents(io);
    
    // Start server
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

// Handle errors
mongoose.connection.on('error', (error) => {
    console.log('Error connecting to MongoDB:', error.message);
});
# Twitter Clone

A full-stack Twitter clone application built with React, Node.js, Express, and MongoDB.

## Features

- User authentication (signup, login, logout)
- Create, read, update, and delete tweets
- Like, retweet, and bookmark tweets
- Follow/unfollow users
- User profiles
- Real-time notifications and messaging using Socket.io
- Responsive design

## Tech Stack

### Frontend
- React.js
- Redux for state management
- Material-UI for UI components
- Socket.io client for real-time features

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for real-time communication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/twitter-clone.git
   cd twitter-clone
   ```

2. Install dependencies for both client and server
   ```
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=8090
   MONGODB_URI=your_mongodb_connection_string
   ACCESS_SECRET_KEY=your_access_token_secret
   REFRESH_SECRET_KEY=your_refresh_token_secret
   CLIENT_URL=http://localhost:3000
   ```

4. Start the development servers
   ```
   # Start the server (from the server directory)
   npm start

   # Start the client (from the client directory)
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## License

This project is licensed under the MIT License.
# Twitter Clone

A full-stack Twitter clone built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- User authentication (signup, login, logout)
- Create, read, update, and delete tweets
- Like and retweet functionality
- Follow/unfollow users
- User profiles with tweet history
- Real-time updates for new tweets and notifications
- Responsive design for mobile and desktop

## Tech Stack

### Frontend
- React.js
- Redux for state management
- Material UI for styling
- Axios for API requests
- Socket.io client for real-time features

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Socket.io for real-time updates
- Multer for file uploads

## Project Structure

```
twitter-clone/
├── client/                 # Frontend React application
│   ├── public/             # Public assets
│   └── src/                # React source files
│       ├── components/     # React components
│       ├── context/        # Context API files
│       ├── redux/          # Redux state management
│       ├── services/       # API service files
│       └── utils/          # Utility functions
└── server/                 # Backend Node.js/Express application
    ├── controllers/        # Route controllers
    ├── models/             # Mongoose models
    ├── routes/             # Express routes
    ├── middleware/         # Custom middleware
    └── utils/              # Utility functions
```

## Getting Started

### Prerequisites
- Node.js and npm installed
- MongoDB installed locally or MongoDB Atlas account

### Installation

1. Clone the repository
2. Install server dependencies:
   ```
   cd server
   npm install
   ```
3. Install client dependencies:
   ```
   cd client
   npm install
   ```

### Running the Application

1. Start the server:
   ```
   cd server
   npm start
   ```
2. Start the client:
   ```
   cd client
   npm start
   ```
3. Open your browser and navigate to `http://localhost:3000`

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```
DB_USERNAME=your_mongodb_username
DB_PASSWORD=your_mongodb_password
ACCESS_SECRET_KEY=your_jwt_secret_key
PORT=8000
```
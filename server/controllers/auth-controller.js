import bcrypt from 'bcrypt';
import User from '../models/user.js';
import { createAccessToken, createRefreshToken } from '../middleware/auth.js';

// User signup
export const signupUser = async (request, response) => {
    try {
        // Check if username already exists
        const usernameExists = await User.findOne({ username: request.body.username });
        if (usernameExists) {
            return response.status(409).json({ message: 'Username already exists' });
        }

        // Check if email already exists
        const emailExists = await User.findOne({ email: request.body.email });
        if (emailExists) {
            return response.status(409).json({ message: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(request.body.password, 10);

        // Create new user
        const user = new User({
            name: request.body.name,
            username: request.body.username,
            email: request.body.email,
            password: hashedPassword
        });

        // Save user to database
        const savedUser = await user.save();

        // Create tokens
        const accessToken = createAccessToken({ id: savedUser._id, username: savedUser.username });
        const refreshToken = createRefreshToken({ id: savedUser._id, username: savedUser.username });

        // Return user data and tokens
        return response.status(201).json({
            message: 'User created successfully',
            user: {
                id: savedUser._id,
                name: savedUser.name,
                username: savedUser.username,
                email: savedUser.email,
                profilePicture: savedUser.profilePicture,
                followers: savedUser.followers,
                following: savedUser.following,
                joinedAt: savedUser.joinedAt
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Error in signupUser:', error.message);
        return response.status(500).json({ message: 'Error while signing up user', error: error.message });
    }
};

// User login
export const loginUser = async (request, response) => {
    try {
        console.log('Login request body:', request.body);
        
        // Find user by username or email
        const user = await User.findOne({
            $or: [
                { username: request.body.username },
                { email: request.body.username }
            ]
        });

        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            return response.status(404).json({ message: 'User not found' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(request.body.password, user.password);
        console.log('Password valid:', isPasswordValid ? 'Yes' : 'No');
        
        if (!isPasswordValid) {
            return response.status(401).json({ message: 'Invalid password' });
        }

        // Create tokens
        const accessToken = createAccessToken({ id: user._id, username: user.username });
        const refreshToken = createRefreshToken({ id: user._id, username: user.username });

        // Return user data and tokens
        return response.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                followers: user.followers,
                following: user.following,
                joinedAt: user.joinedAt
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Error in loginUser:', error.message);
        return response.status(500).json({ message: 'Error while logging in user', error: error.message });
    }
};

// Logout user
export const logoutUser = async (request, response) => {
    try {
        // In a real implementation, you might want to invalidate the refresh token
        // by storing it in a blacklist or database
        return response.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error in logoutUser:', error.message);
        return response.status(500).json({ message: 'Error while logging out user', error: error.message });
    }
};
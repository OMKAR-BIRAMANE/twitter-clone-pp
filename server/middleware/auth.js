import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Middleware to authenticate token
export const authenticateToken = (request, response, next) => {
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return response.status(401).json({ message: 'Access token is required' });
    }

    try {
        const user = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
        request.user = user;
        next();
    } catch (error) {
        return response.status(403).json({ message: 'Invalid or expired token' });
    }
};

// Create access token
export const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_SECRET_KEY, { expiresIn: '15m' });
};

// Create refresh token
export const createRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_SECRET_KEY, { expiresIn: '7d' });
};

// Verify refresh token and generate new access token
export const refreshAccessToken = (request, response) => {
    const refreshToken = request.body.token;
    
    if (!refreshToken) {
        return response.status(401).json({ message: 'Refresh token is required' });
    }

    try {
        const user = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
        const accessToken = createAccessToken({ id: user.id, username: user.username });
        
        return response.status(200).json({ accessToken });
    } catch (error) {
        return response.status(403).json({ message: 'Invalid refresh token' });
    }
};
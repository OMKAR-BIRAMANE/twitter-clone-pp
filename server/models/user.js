import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: '',
        maxlength: 160
    },
    location: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    profilePicture: {
        type: String,
        default: ''
    },
    coverPicture: {
        type: String,
        default: ''
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tweets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet'
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet'
    }],
    retweets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet'
    }],
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet'
    }],
    joinedAt: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
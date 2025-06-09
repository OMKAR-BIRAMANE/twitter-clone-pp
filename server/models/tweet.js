import mongoose from 'mongoose';

const tweetSchema = mongoose.Schema({
    content: {
        type: String,
        required: true,
        maxlength: 280
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    media: [{
        type: String
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    retweets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet'
    }],
    parentTweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
        default: null
    },
    isRetweet: {
        type: Boolean,
        default: false
    },
    originalTweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
        default: null
    },
    isReply: {
        type: Boolean,
        default: false
    },
    hashtags: [{
        type: String
    }],
    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isQuote: {
        type: Boolean,
        default: false
    },
    quotedTweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
        default: null
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
tweetSchema.index({ author: 1, createdAt: -1 });
tweetSchema.index({ hashtags: 1 });
tweetSchema.index({ mentions: 1 });

const Tweet = mongoose.model('Tweet', tweetSchema);

export default Tweet;
import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'retweet', 'reply', 'mention', 'follow', 'quote'],
        required: true
    },
    tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
import mongoose from 'mongoose';

const messageSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    media: {
        type: String,
        default: ''
    },
    isRead: {
        type: Boolean,
        default: false
    },
    conversation: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ conversation: 1, createdAt: 1 });

// Static method to generate a unique conversation ID for two users
messageSchema.statics.getConversationId = function(userId1, userId2) {
    // Sort the IDs to ensure consistency regardless of sender/recipient order
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
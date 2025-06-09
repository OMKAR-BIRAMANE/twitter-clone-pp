import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import dotenv from 'dotenv';

dotenv.config();

// Create storage engine for file uploads
const storage = new GridFsStorage({
    url: `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter-clone.mongodb.net/?retryWrites=true&w=majority`,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (request, file) => {
        const match = ["image/png", "image/jpg", "image/jpeg", "image/gif"];

        if (match.indexOf(file.mimetype) === -1) {
            return `${Date.now()}-${file.originalname}`;
        }

        return {
            bucketName: "uploads",
            filename: `${Date.now()}-${file.originalname}`
        };
    }
});

// Configure multer middleware
const upload = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    }
});

export default upload;
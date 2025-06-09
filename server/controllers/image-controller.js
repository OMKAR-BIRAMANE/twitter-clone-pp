import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let gfs;

// Initialize GridFS bucket
const connectGridFS = (db) => {
    gfs = new GridFSBucket(db, {
        bucketName: 'uploads'
    });
};

// Get image by filename
export const getImage = async (request, response) => {
    try {
        const { filename } = request.params;
        
        // Check if file exists
        const files = await gfs.find({ filename }).toArray();
        
        if (!files || files.length === 0) {
            return response.status(404).json({ message: 'Image not found' });
        }
        
        // Set content type
        response.set('Content-Type', files[0].contentType);
        
        // Create read stream
        const readStream = gfs.openDownloadStreamByName(filename);
        readStream.pipe(response);
    } catch (error) {
        console.error('Error in getImage:', error.message);
        return response.status(500).json({ message: 'Error while getting image', error: error.message });
    }
};

// Delete image by filename
export const deleteImage = async (request, response) => {
    try {
        const { filename } = request.params;
        
        // Check if file exists
        const files = await gfs.find({ filename }).toArray();
        
        if (!files || files.length === 0) {
            return response.status(404).json({ message: 'Image not found' });
        }
        
        // Delete file
        await gfs.delete(files[0]._id);
        
        return response.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error in deleteImage:', error.message);
        return response.status(500).json({ message: 'Error while deleting image', error: error.message });
    }
};

export default connectGridFS;
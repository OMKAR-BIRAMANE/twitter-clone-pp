import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const Connection = async () => {
    // Using the provided MongoDB Atlas connection string
    const URL = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.au7ednt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
    
    try {
        await mongoose.connect(URL, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true
        });
        console.log('Database connected successfully');
    } catch (error) {
        console.log('Error while connecting to the database:', error.message);
    }
};

export default Connection;
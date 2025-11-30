import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async (mongoConf) => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    const { DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME } = process.env;
    const uri = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=${DB_NAME}`;

    try {
        await mongoose.connect(uri);
        isConnected = true;
        console.log('Database connected successfully');
        return mongoose.connection;
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};

export default connectDB;
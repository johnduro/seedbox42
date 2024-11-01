import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async (mongoConf) => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

//    uri = "mongodb://" + mongoConf.address + '/' + mongoConf.name
    var uri = "mongodb://mongouser:mongopass@mongodb:27017/seedapp"

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
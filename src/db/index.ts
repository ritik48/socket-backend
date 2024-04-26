import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/socket-db";

const connectDb = async () => {
    await mongoose.connect(MONGO_URI);
};

export { connectDb };

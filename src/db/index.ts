import mongoose from "mongoose";

const connectDb = async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/socket-db");
};

export { connectDb };

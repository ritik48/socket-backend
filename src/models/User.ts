import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("user", userSchema);

export { User };

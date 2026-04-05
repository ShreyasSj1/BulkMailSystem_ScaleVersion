import "dotenv/config";
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const { MONGO_URI } = process.env;

    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not configured.");
    }

    await mongoose.connect(MONGO_URI);
    console.log(`[${new Date().toISOString()}] MongoDB connected`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] MongoDB connection error:`, error);
    throw error;
  }
};

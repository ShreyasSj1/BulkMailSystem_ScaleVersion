import mongoose from "mongoose";

const unsubscribedUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    unsubscribedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

const UnsubscribedUser = mongoose.model(
  "UnsubscribedUser",
  unsubscribedUserSchema
);

export default UnsubscribedUser;

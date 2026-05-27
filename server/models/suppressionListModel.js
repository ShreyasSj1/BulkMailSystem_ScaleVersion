import mongoose from "mongoose";

const suppressionListSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: false,
    collection: "SuppressionList"
  }
);

const SuppressionList = mongoose.model("SuppressionList", suppressionListSchema);

export default SuppressionList;

import { Schema, model, Document, Types } from "mongoose";

export interface IPost extends Document {
  _id: Types.ObjectId;
  title: string;
  content: string;
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Serves Scenario 2: match posts by author (the $match stage of the $lookup pipeline)
// and pagination of a user's posts. (Explicit schema.index.)
postSchema.index({ author: 1 });

export const Post = model<IPost>("Post", postSchema);

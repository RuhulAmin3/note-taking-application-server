import { Schema, model, Document, Types } from "mongoose";

export interface INote extends Document {
  _id: Types.ObjectId;
  title: string;
  content: string;
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Serves "user listing their own notes": filter by owner, sort by createdAt desc,
// paginate — all covered by this single compound index. (Explicit schema.index.)
noteSchema.index({ owner: 1, createdAt: -1 });

export const Note = model<INote>("Note", noteSchema);

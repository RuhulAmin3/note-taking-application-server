import { Schema, model, Document, Types } from "mongoose";
import { hashPassword } from "../../utils/password";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    interests: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Explicit index (spec: use schema.index so it is visible during review).
// Serves login lookup by email AND enforces uniqueness. No inline index options.
userSchema.index({ email: 1 }, { unique: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await hashPassword(this.password);
});

export const User = model<IUser>("User", userSchema);

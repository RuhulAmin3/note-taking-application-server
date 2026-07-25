import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { User } from "./modules/user/user.model";

async function seed() {
  await connectDB();
  const email = "admin@test.com";
  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({
      name: "Admin",
      email,
      password: "adminpass123",
      role: "admin",
      interests: ["reading", "chess"],
    });
    console.log("Admin created:", email, "/ adminpass123");
  } else {
    console.log("Admin already exists");
  }
  await mongoose.disconnect();
}
seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

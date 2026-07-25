import { User } from "../user/user.model";
import { comparePassword } from "../../utils/password";
import { signToken } from "../../utils/jwt";
import { AppError } from "../../middleware/error";
import { RegisterInput, LoginInput } from "./auth.validation";

export async function registerUser(input: RegisterInput) {
  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    interests: input.interests ?? [],
    role: "user",
  });
  const token = signToken({ id: user._id.toString(), role: user.role });
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, interests: user.interests },
  };
}

export async function loginUser(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user) throw new AppError(401, "Invalid credentials");
  const ok = await comparePassword(input.password, user.password);
  if (!ok) throw new AppError(401, "Invalid credentials");
  const token = signToken({ id: user._id.toString(), role: user.role });
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
}

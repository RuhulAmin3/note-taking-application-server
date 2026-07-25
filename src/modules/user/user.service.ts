import { User } from "./user.model";
import { AppError } from "../../middleware/error";
import { parsePagination, buildMeta } from "../../utils/pagination";
import { AdminCreateInput, AdminUpdateInput } from "./user.validation";

const PUBLIC = "name email role interests createdAt";

export async function getMe(userId: string) {
  const user = await User.findById(userId).select(PUBLIC);
  if (!user) throw new AppError(404, "User not found");
  return user;
}

// admin list all users. Unfiltered → sort/paginate by _id (default index).
export async function listUsers(query: Record<string, unknown>) {
  const { page, limit, skip } = parsePagination(query);
  const [data, total] = await Promise.all([
    User.find().select(PUBLIC).sort({ _id: -1 }).skip(skip).limit(limit),
    User.estimatedDocumentCount(),
  ]);
  return { data, meta: buildMeta(total, page, limit) };
}

export async function getUser(id: string) {
  const user = await User.findById(id).select(PUBLIC);
  if (!user) throw new AppError(404, "User not found");
  return user;
}

export async function createUser(input: AdminCreateInput) {
  const user = await User.create({ ...input, interests: input.interests ?? [] });
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

export async function updateUser(id: string, input: AdminUpdateInput) {
  const user = await User.findByIdAndUpdate(id, input, { new: true, runValidators: true }).select(PUBLIC);
  if (!user) throw new AppError(404, "User not found");
  return user;
}

export async function deleteUser(id: string, requesterId: string) {
  if (id === requesterId) throw new AppError(400, "You cannot delete your own account");
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new AppError(404, "User not found");
}

// Scenario 1: group users by interests. EXACTLY ONE aggregate() call, no other methods.
// $facet keeps the total in the same pipeline (no separate countDocuments).
export async function groupByInterests() {
  const result = await User.aggregate([
    { $unwind: "$interests" },
    {
      $group: {
        _id: "$interests",
        count: { $sum: 1 },
        users: { $push: { id: "$_id", name: "$name", email: "$email" } },
      },
    },
    { $sort: { count: -1, _id: 1 } },
    {
      $facet: {
        groups: [{ $project: { _id: 0, interest: "$_id", count: 1, users: 1 } }],
        totalInterests: [{ $count: "value" }],
      },
    },
  ]);
  return result[0];
}

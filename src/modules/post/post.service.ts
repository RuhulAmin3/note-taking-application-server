import { Types } from "mongoose";
import { Post } from "./post.model";
import { AppError } from "../../middleware/error";
import { parsePagination, buildMeta } from "../../utils/pagination";
import { PostBodyInput } from "./post.validation";

export function createPost(authorId: string, input: PostBodyInput) {
  return Post.create({ ...input, author: authorId });
}

// Scenario 2: all posts of a particular user via a SINGLE pipeline with $lookup.
// Base collection = Post so the { author: 1 } index serves the $match directly,
// and $skip/$limit paginate. $lookup joins author info from users.
export async function getUserPosts(userId: string, query: Record<string, unknown>) {
  if (!Types.ObjectId.isValid(userId)) throw new AppError(400, "Invalid userId");
  const { page, limit, skip } = parsePagination(query);
  const authorId = new Types.ObjectId(userId);

  const result = await Post.aggregate([
    { $match: { author: authorId } },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" } },
          { $unwind: "$author" },
          {
            $project: {
              title: 1, content: 1, createdAt: 1,
              "author._id": 1, "author.name": 1, "author.email": 1,
            },
          },
        ],
        total: [{ $count: "value" }],
      },
    },
  ]);

  const facet = result[0];
  const total = facet.total[0]?.value ?? 0;
  return { data: facet.data, meta: buildMeta(total, page, limit) };
}

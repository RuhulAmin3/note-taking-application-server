import { app } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

async function main() {
  await connectDB();
  app.listen(env.PORT, () => console.log(`API on :${env.PORT}`));
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

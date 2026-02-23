import "./lib/env.js";
import app from "./app.js";
import { env } from "./lib/env.js";
import { connectMongo } from "./lib/mongo.js";

await connectMongo();

app.listen(env.port, () => {
  console.log(`[server] http://localhost:${env.port}`);
});

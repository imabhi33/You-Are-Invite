import app from "../src/app.js";
import { connectMongo } from "../src/lib/mongo.js";

export default async function handler(req, res) {
  await connectMongo();
  return app(req, res);
}

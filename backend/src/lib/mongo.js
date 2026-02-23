import mongoose from "mongoose";
import { env } from "./env.js";

let isConnected = false;

export async function connectMongo() {
  if (isConnected) return;
  await mongoose.connect(env.mongoUri, { dbName: "invite" });
  isConnected = true;
  console.log("[mongo] connected");
}
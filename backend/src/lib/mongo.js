import mongoose from "mongoose";
import { env } from "./env.js";

let isConnected = false;

async function cleanupLegacyIndexes() {
  try {
    const collection = mongoose.connection.collection("invitations");
    const indexes = await collection.indexes();
    const hasLegacyPaymentIndex = indexes.some((idx) => idx.name === "paymentId_1");

    if (hasLegacyPaymentIndex) {
      await collection.dropIndex("paymentId_1");
      console.log("[mongo] dropped legacy index paymentId_1");
    }
  } catch (error) {
    console.warn("[mongo] legacy index cleanup skipped:", error.message);
  }
}

export async function connectMongo() {
  if (isConnected) return;
  await mongoose.connect(env.mongoUri, { dbName: "invite" });
  await cleanupLegacyIndexes();
  isConnected = true;
  console.log("[mongo] connected");
}

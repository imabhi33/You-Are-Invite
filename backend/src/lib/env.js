import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:3000",
  mongoUri: process.env.MONGODB_URI,
  cloudName: process.env.CLOUD_NAME,
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: process.env.SMTP_PORT || "",
  smtpSecure: process.env.SMTP_SECURE || "false",
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFromEmail: process.env.SMTP_FROM_EMAIL || "",
  smtpFromName: process.env.SMTP_FROM_NAME || "You Are Invite"
};

const required = ["MONGODB_URI", "CLOUD_NAME", "API_KEY", "API_SECRET"];
for (const key of required) {
  if (!process.env[key]) {
    console.warn(`[env] Missing ${key}`);
  }
}

import express from "express";
import { cloudinary } from "../lib/cloudinary.js";
import { env } from "../lib/env.js";
import { sendInviteEmailSmtp } from "../lib/smtp.js";
import { Invitation } from "../models/Invitation.js";
import { createEditToken, createUniqueSlug } from "../utils/slug.js";

const router = express.Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "invite-backend" });
});

router.post("/uploads/signature", asyncHandler(async (_req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "invite-saas";
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    env.apiSecret
  );

  return res.json({
    timestamp,
    folder,
    signature,
    cloudName: env.cloudName,
    apiKey: env.apiKey
  });
}));

router.post("/invitations/create", asyncHandler(async (req, res) => {
  const {
    groomName,
    brideName,
    eventDate,
    venue,
    coverImageUrl,
    galleryUrls,
    events,
    theme,
    email,
    imageFit,
    imagePosition,
    imageSettings
  } = req.body;

  if (!groomName || !brideName || !eventDate || !venue) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  if (!email) {
    return res.status(400).json({ message: "Email is required to deliver your links" });
  }

  const slug = await createUniqueSlug(groomName, brideName);
  const editToken = createEditToken();

  const invite = await Invitation.create({
    slug,
    groomName,
    brideName,
    eventDate,
    venue,
    coverImageUrl: coverImageUrl || "",
    galleryUrls: Array.isArray(galleryUrls) ? galleryUrls.slice(0, 3) : [],
    events: Array.isArray(events) ? events.slice(0, 4) : [],
    theme: theme || "royal",
    email: email || "",
    imageFit: imageFit || "cover",
    imagePosition: imagePosition || "center",
    imageSettings,
    editToken
  });

  const inviteUrl = `${env.appBaseUrl}/${invite.slug}`;
  const editUrl = `${env.appBaseUrl}/edit/${invite.slug}?token=${invite.editToken}`;
  let emailSent = true;
  let emailError = "";

  try {
    await sendInviteEmailSmtp({
      toEmail: email,
      groomName,
      brideName,
      eventDate,
      venue,
      inviteUrl
    });
  } catch (error) {
    emailSent = false;
    emailError = error.message || "Invite created, but email could not be sent.";
    console.error("[smtp] invite email failed:", error.message);
  }

  return res.json({
    slug: invite.slug,
    inviteUrl,
    editUrl,
    editToken: invite.editToken,
    emailSent,
    emailError
  });
}));

router.get("/invitations/:slug", asyncHandler(async (req, res) => {
  const invite = await Invitation.findOne({ slug: req.params.slug }).lean();
  if (!invite) return res.status(404).json({ message: "Invitation not found" });
  return res.json(invite);
}));

router.patch("/invitations/edit/:token", asyncHandler(async (req, res) => {
  const updates = {
    eventDate: req.body.eventDate,
    venue: req.body.venue,
    coverImageUrl: req.body.coverImageUrl,
    galleryUrls: Array.isArray(req.body.galleryUrls) ? req.body.galleryUrls.slice(0, 3) : req.body.galleryUrls,
    events: req.body.events,
    theme: req.body.theme,
    imageFit: req.body.imageFit,
    imagePosition: req.body.imagePosition,
    imageSettings: req.body.imageSettings
  };

  Object.keys(updates).forEach((k) => {
    if (updates[k] == null || updates[k] === "") delete updates[k];
  });

  const invite = await Invitation.findOneAndUpdate(
    { editToken: req.params.token },
    updates,
    { new: true }
  ).lean();

  if (!invite) return res.status(404).json({ message: "Invalid edit token" });
  return res.json({ message: "Updated", invite });
}));

export default router;

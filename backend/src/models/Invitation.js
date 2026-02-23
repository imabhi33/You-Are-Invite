import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    dateLabel: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" }
  },
  { _id: false }
);

const imageSettingSchema = new mongoose.Schema(
  {
    fit: { type: String, default: "cover" },
    x: { type: Number, default: 50 },
    y: { type: Number, default: 50 },
    zoom: { type: Number, default: 1 }
  },
  { _id: false }
);

const invitationSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    groomName: { type: String, required: true, trim: true },
    brideName: { type: String, required: true, trim: true },
    eventDate: { type: String, required: true },
    venue: { type: String, required: true, trim: true },
    coverImageUrl: { type: String, default: "" },
    galleryUrls: { type: [String], default: [] },
    events: { type: [eventSchema], default: [] },
    theme: { type: String, default: "royal" },
    email: { type: String, default: "" },
    imageFit: { type: String, default: "cover" },
    imagePosition: { type: String, default: "center" },
    imageSettings: {
      cover: { type: imageSettingSchema, default: () => ({ fit: "cover", x: 50, y: 50, zoom: 1 }) },
      gallery: {
        type: [imageSettingSchema],
        default: () =>
          Array.from({ length: 3 }, () => ({ fit: "cover", x: 50, y: 50, zoom: 1 }))
      }
    },
    editToken: { type: String, required: true, unique: true, index: true }
  },
  { timestamps: true }
);

export const Invitation = mongoose.model("Invitation", invitationSchema);

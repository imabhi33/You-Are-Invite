import { nanoid } from "nanoid";
import { Invitation } from "../models/Invitation.js";

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createUniqueSlug(groomName, brideName) {
  const base = `${slugify(groomName)}-weds-${slugify(brideName)}`;

  for (let i = 0; i < 6; i += 1) {
    const slug = `${base}-${nanoid(4).toLowerCase()}`;
    const exists = await Invitation.exists({ slug });
    if (!exists) return slug;
  }

  return `${base}-${Date.now().toString().slice(-6)}`;
}

export function createEditToken() {
  return nanoid(28);
}
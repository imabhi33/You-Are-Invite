import { nanoid } from "nanoid";

const safeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);

export function buildObjectKey(originalName = "upload", fileType = "image/jpeg") {
  const extension = (originalName.split(".").pop() || "jpg").toLowerCase();
  const cleanedExt = extension.replace(/[^a-z0-9]/g, "") || "jpg";
  return `invites/${Date.now()}-${nanoid(8)}.${cleanedExt}`;
}

export function validateUploadType(fileType) {
  return safeTypes.has(fileType);
}
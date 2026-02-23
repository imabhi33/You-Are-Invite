const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

export async function uploadToCloudinary(file) {
  const sign = await api("/api/uploads/signature", { method: "POST" });

  const data = new FormData();
  data.append("file", file);
  data.append("api_key", sign.apiKey);
  data.append("timestamp", sign.timestamp);
  data.append("signature", sign.signature);
  data.append("folder", sign.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, {
    method: "POST",
    body: data
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "Upload failed");
  return json.secure_url;
}
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export function generateUploadSignature(folder: string, timestamp?: number) {
  const ts = timestamp || Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp: ts, folder },
    process.env.CLOUDINARY_API_SECRET || ""
  );
  return { timestamp: ts, signature, apiKey: process.env.CLOUDINARY_API_KEY };
}

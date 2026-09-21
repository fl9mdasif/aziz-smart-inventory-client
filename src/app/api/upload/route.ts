import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB — client compresses to ~100KB, this is a server-side backstop

export async function POST(req: NextRequest) {
  // This route has no session of its own — without this check, anyone who
  // finds the endpoint could POST directly (bypassing the dashboard
  // entirely) and use this project's Cloudinary account as a free,
  // unauthenticated file host. Verify the caller's token against the real
  // backend instead of trusting that only the logged-in dashboard calls it.
  const authorization = req.headers.get("authorization");
  if (!authorization) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const meRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/me`, {
    headers: { authorization },
  });
  if (!meRes.ok) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, message: "No image provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ success: false, message: "File must be an image" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ success: false, message: "Image is too large" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "aziz-inventory", resource_type: "image" },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error("Upload failed"));
          resolve(result as { secure_url: string });
        },
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", JSON.stringify(error, Object.getOwnPropertyNames(error as object)));
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}

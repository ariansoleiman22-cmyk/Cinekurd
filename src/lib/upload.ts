import "server-only";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { put } from "@vercel/blob";

const MAX_BYTES = 6 * 1024 * 1024; // 6 MB
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export type SaveResult =
  | { url: string }
  | { error: "empty" | "too_large" | "type" | "failed" };

export async function saveImage(file: File): Promise<SaveResult> {
  if (!file || file.size === 0) return { error: "empty" };
  if (file.size > MAX_BYTES) return { error: "too_large" };
  const ext = ALLOWED[file.type];
  if (!ext) return { error: "type" };

  const filename = `products/${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;

  // 1) ImgBB (free image host) — set IMGBB_API_KEY to use it.
  if (process.env.IMGBB_API_KEY) {
    try {
      const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
      const body = new URLSearchParams();
      body.append("image", base64);
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        { method: "POST", body },
      );
      const json = (await res.json()) as { data?: { url?: string } };
      const url = json?.data?.url;
      if (!res.ok || !url) return { error: "failed" };
      return { url };
    } catch {
      return { error: "failed" };
    }
  }

  // 2) Vercel Blob — set up a Blob store (BLOB_READ_WRITE_TOKEN) to use it.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(filename, file, {
        access: "public",
        addRandomSuffix: false,
        contentType: file.type,
      });
      return { url: blob.url };
    } catch {
      return { error: "failed" };
    }
  }

  // 3) Local development fallback (writable filesystem only).
  if (process.env.VERCEL) return { error: "failed" };
  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const name = filename.split("/").pop()!;
  await writeFile(join(dir, name), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${name}` };
}

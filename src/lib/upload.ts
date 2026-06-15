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

export type SaveResult = { url: string } | { error: "empty" | "too_large" | "type" };

export async function saveImage(file: File): Promise<SaveResult> {
  if (!file || file.size === 0) return { error: "empty" };
  if (file.size > MAX_BYTES) return { error: "too_large" };
  const ext = ALLOWED[file.type];
  if (!ext) return { error: "type" };

  const filename = `products/${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;

  // When a Blob store is configured (production on Vercel), upload to cloud storage —
  // the server filesystem there is read-only.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });
    return { url: blob.url };
  }

  // Local development fallback: write to /public/uploads.
  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const name = filename.split("/").pop()!;
  await writeFile(join(dir, name), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${name}` };
}

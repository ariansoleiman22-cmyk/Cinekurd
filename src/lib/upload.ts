import "server-only";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

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

  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(dir, name), buffer);
  return { url: `/uploads/${name}` };
}

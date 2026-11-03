import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { adminUser } from "@/lib/auth";

// shortcut: saves to public/products on local disk; on Vercel the filesystem is read-only, so paste image URLs there.
const MAGIC: [string, number[]][] = [
  ["jpg", [0xff, 0xd8, 0xff]],
  ["png", [0x89, 0x50, 0x4e, 0x47]],
  ["webp", [0x52, 0x49, 0x46, 0x46]], // "RIFF"
];

export async function POST(req: Request) {
  if (!(await adminUser())) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const files = (await req.formData()).getAll("file").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (files.length > 10) return NextResponse.json({ error: "Up to 10 images at a time" }, { status: 400 });

  const saved: { name: string; buf: Buffer }[] = [];
  for (const file of files) {
    if (file.size > 2_000_000) return NextResponse.json({ error: `${file.name}: must be under 2 MB` }, { status: 400 });
    const buf = Buffer.from(await file.arrayBuffer());
    const ext = MAGIC.find(([, sig]) => sig.every((b, i) => buf[i] === b))?.[0];
    if (!ext) return NextResponse.json({ error: `${file.name}: only JPG, PNG or WebP images` }, { status: 400 });
    saved.push({ name: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`, buf });
  }
  try {
    const dir = path.join(process.cwd(), "public", "products");
    await mkdir(dir, { recursive: true });
    for (const s of saved) await writeFile(path.join(dir, s.name), s.buf);
  } catch {
    return NextResponse.json({ error: "Uploads are not available here. Paste image URLs instead." }, { status: 501 });
  }
  const urls = saved.map((s) => `/products/${s.name}`);
  return NextResponse.json({ urls, url: urls[0] });
}

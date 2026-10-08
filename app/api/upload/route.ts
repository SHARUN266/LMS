import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_EXTENSIONS = [
  ".xlsx", ".xls", ".csv",                     // Excel
  ".pbix",                                      // Power BI
  ".ipynb",                                     // Jupyter
  ".pdf", ".docx", ".md",                       // Documents / Reports
  ".png", ".jpg", ".jpeg", ".webp", ".gif",     // Screenshots & Proof
  ".sql", ".py", ".json",                       // Code files
  ".zip",                                       // Project Archives
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File exceeds 25MB limit (current: ${(file.size / (1024 * 1024)).toFixed(1)}MB)` },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `File type ${ext} not supported. Allowed formats: ${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 400 }
      );
    }

    // Create uploads directory in public folder
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Generate sanitized unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${timestamp}_${randomSuffix}_${safeName}`;
    const filepath = path.join(uploadDir, filename);

    // Save file buffer
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename: file.name,
      storedName: filename,
      size: file.size,
      type: ext,
      success: true,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "File upload failed", details: error.message },
      { status: 500 }
    );
  }
}

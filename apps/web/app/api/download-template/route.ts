import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filename = "selly-base-template.xlsx";

    // Try several candidate locations to handle different process.cwd() values
    const candidates = [
      path.join(process.cwd(), "apps", "web", "lib", "template", filename),
      path.join(process.cwd(), "lib", "template", filename),
      path.join(process.cwd(), "public", "templates", filename),
    ];

    let foundPath: string | null = null;
    for (const p of candidates) {
      try {
        await fs.promises.access(p, fs.constants.R_OK);
        foundPath = p;
        break;
      } catch (e) {
        // continue
      }
    }

    if (!foundPath) {
      console.error("Template file not found. Tried:", candidates);
      return new NextResponse("Template not found", { status: 404 });
    }

    const data = await fs.promises.readFile(foundPath);
    const uint8 = new Uint8Array(data);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Failed to read template file", err);
    return new NextResponse("Template not found", { status: 404 });
  }
}

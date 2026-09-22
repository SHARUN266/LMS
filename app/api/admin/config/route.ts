import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    let config = await db.adminConfig.findFirst();
    if (!config) {
      config = await db.adminConfig.create({
        data: {
          id: "admin_default",
          activeModel: "gemini-2.5-flash",
          strictness: 85,
          passingThreshold: 70,
        },
      });
    }
    return NextResponse.json({ config, success: true });
  } catch (error: any) {
    console.error("Error fetching admin config:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin config", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { activeModel, strictness, passingThreshold } = body;

    let config = await db.adminConfig.findFirst();
    if (!config) {
      config = await db.adminConfig.create({
        data: {
          id: "admin_default",
          activeModel: activeModel || "gemini-2.5-flash",
          strictness: typeof strictness === "number" ? strictness : 85,
          passingThreshold: typeof passingThreshold === "number" ? passingThreshold : 70,
        },
      });
    } else {
      config = await db.adminConfig.update({
        where: { id: config.id },
        data: {
          ...(activeModel ? { activeModel } : {}),
          ...(typeof strictness === "number" ? { strictness } : {}),
          ...(typeof passingThreshold === "number" ? { passingThreshold } : {}),
        },
      });
    }

    return NextResponse.json({ config, success: true });
  } catch (error: any) {
    console.error("Error updating admin config:", error);
    return NextResponse.json(
      { error: "Failed to update admin config", details: error.message },
      { status: 500 }
    );
  }
}

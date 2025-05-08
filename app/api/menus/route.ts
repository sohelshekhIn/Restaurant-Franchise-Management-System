import { NextResponse } from "next/server";
import { z } from "zod";
import { executeQuery } from "@/lib/db/db";
import { RowDataPacket } from "mysql2";

interface MaxIdResult extends RowDataPacket {
  maxId: number | null;
}

const menuSchema = z.object({
  MenuName: z.string().min(1, "Menu name is required"),
  Description: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = menuSchema.parse(body);

    // First, get the maximum MenuId to generate a new one
    const [maxIdResult] = await executeQuery<MaxIdResult[]>(
      "SELECT MAX(MenuId) as maxId FROM menu"
    );

    const newMenuId = (maxIdResult.maxId || 0) + 1;

    // Insert with the new MenuId
    await executeQuery(
      "INSERT INTO menu (MenuId, MenuName, Description) VALUES (?, ?, ?)",
      [newMenuId, validatedData.MenuName, validatedData.Description || null]
    );

    return NextResponse.json(
      { message: "Menu created successfully", menuId: newMenuId },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating menu:", error);
    return NextResponse.json(
      { error: "Failed to create menu" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const menus = await executeQuery(
      "SELECT MenuId, MenuName, Description FROM menu ORDER BY MenuName"
    );

    return NextResponse.json(menus);
  } catch (error) {
    console.error("Error fetching menus:", error);
    return NextResponse.json(
      { error: "Failed to fetch menus" },
      { status: 500 }
    );
  }
}

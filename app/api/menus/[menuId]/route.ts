import { NextResponse } from "next/server";
import { z } from "zod";
import { executeQuery } from "@/lib/db/db";

const menuSchema = z.object({
  MenuName: z.string().min(1, "Menu name is required"),
  Description: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { menuId: string } }
) {
  try {
    const menuId = parseInt(params.menuId);

    if (isNaN(menuId)) {
      return NextResponse.json({ error: "Invalid menu ID" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = menuSchema.parse(body);

    await executeQuery(
      "UPDATE menu SET MenuName = ?, Description = ? WHERE MenuId = ?",
      [validatedData.MenuName, validatedData.Description, menuId]
    );

    return NextResponse.json({ message: "Menu updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating menu:", error);
    return NextResponse.json(
      { error: "Failed to update menu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { menuId: string } }
) {
  try {
    const menuId = parseInt(params.menuId);

    if (isNaN(menuId)) {
      return NextResponse.json({ error: "Invalid menu ID" }, { status: 400 });
    }

    // Check if menu has any dishes
    const dishes = await executeQuery<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM dish WHERE MenuId = ?",
      [menuId]
    );

    if (dishes[0].count > 0) {
      return NextResponse.json(
        { error: "Cannot delete menu with existing dishes" },
        { status: 400 }
      );
    }

    await executeQuery("DELETE FROM menu WHERE MenuId = ?", [menuId]);

    return NextResponse.json({ message: "Menu deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu:", error);
    return NextResponse.json(
      { error: "Failed to delete menu" },
      { status: 500 }
    );
  }
}

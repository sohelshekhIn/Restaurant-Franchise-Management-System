import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db/config";
import { z } from "zod";

const dishSchema = z.object({
  DishName: z.string().min(1, "Dish name is required"),
  Description: z.string().optional(),
  Price: z.coerce.number().min(0, "Price must be a positive number"),
  MenuId: z.coerce.number().min(1, "Menu is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = dishSchema.parse(body);

    const connection = await createConnection();

    try {
      // Check if menu exists
      const [menuRows] = await connection.execute(
        "SELECT MenuId FROM menu WHERE MenuId = ?",
        [validatedData.MenuId]
      );

      if (!Array.isArray(menuRows) || menuRows.length === 0) {
        return NextResponse.json({ error: "Menu not found" }, { status: 404 });
      }

      // Get the next available DishId
      const [idResult] = await connection.execute(
        "SELECT MAX(DishId) as maxId FROM dish"
      );
      const maxId =
        Array.isArray(idResult) && idResult.length > 0 && "maxId" in idResult[0]
          ? (idResult[0].maxId || 0) + 1
          : 1;

      // Insert the new dish with explicit DishId
      const [result] = await connection.execute(
        "INSERT INTO dish (DishId, DishName, Description, Price, MenuId) VALUES (?, ?, ?, ?, ?)",
        [
          maxId,
          validatedData.DishName,
          validatedData.Description || null,
          validatedData.Price,
          validatedData.MenuId,
        ]
      );

      if (!("insertId" in result)) {
        throw new Error("Failed to insert dish");
      }

      return NextResponse.json(
        {
          message: "Dish created successfully",
          DishId: maxId,
          DishName: validatedData.DishName,
          Description: validatedData.Description,
          Price: validatedData.Price,
          MenuId: validatedData.MenuId,
        },
        { status: 201 }
      );
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error creating dish:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create dish" },
      { status: 500 }
    );
  }
}

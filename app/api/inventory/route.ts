import { NextResponse } from "next/server";
import { z } from "zod";
import { executeQuery } from "@/lib/db/db";

const inventorySchema = z.object({
  ingredientName: z.string().min(1, "Ingredient name is required"),
  menuId: z.number().min(1, "Menu ID is required"),
  dishId: z.number().min(1, "Dish ID is required"),
  price: z.number().min(0, "Price must be a positive number"),
});

export async function GET() {
  try {
    const query = `
      SELECT 
        i.IngredientId,
        i.MenuId,
        i.DishId,
        i.IngredientName,
        i.Price,
        d.DishName,
        m.MenuName
      FROM ingredient i
      JOIN dish d ON i.DishId = d.DishId
      JOIN menu m ON i.MenuId = m.MenuId
      ORDER BY i.IngredientName
    `;

    const result = await executeQuery(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = inventorySchema.parse(body);

    const query = `
      INSERT INTO ingredient (
        IngredientName,
        MenuId,
        DishId,
        Price
      ) VALUES (?, ?, ?, ?)
    `;

    const result = (await executeQuery(query, [
      validatedData.ingredientName,
      validatedData.menuId,
      validatedData.dishId,
      validatedData.price,
    ])) as { insertId: number };

    return NextResponse.json(
      { message: "Inventory item created successfully", id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating inventory item:", error);
    return NextResponse.json(
      { error: "Failed to create inventory item" },
      { status: 500 }
    );
  }
}

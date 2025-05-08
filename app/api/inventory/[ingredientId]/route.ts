import { NextResponse } from "next/server";
import { z } from "zod";
import { executeQuery } from "@/lib/db/db";

const inventorySchema = z.object({
  ingredientName: z.string().min(1, "Ingredient name is required"),
  menuId: z.number().min(1, "Menu ID is required"),
  dishId: z.number().min(1, "Dish ID is required"),
  price: z.number().min(0, "Price must be a positive number"),
});

export async function PATCH(
  request: Request,
  { params }: { params: { ingredientId: string } }
) {
  try {
    const ingredientId = parseInt(params.ingredientId);
    if (isNaN(ingredientId)) {
      return NextResponse.json(
        { error: "Invalid ingredient ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = inventorySchema.parse(body);

    const query = `
      UPDATE ingredient
      SET 
        IngredientName = ?,
        MenuId = ?,
        DishId = ?,
        Price = ?
      WHERE IngredientId = ?
    `;

    await executeQuery(query, [
      validatedData.ingredientName,
      validatedData.menuId,
      validatedData.dishId,
      validatedData.price,
      ingredientId,
    ]);

    return NextResponse.json(
      { message: "Inventory item updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating inventory item:", error);
    return NextResponse.json(
      { error: "Failed to update inventory item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { ingredientId: string } }
) {
  try {
    const { ingredientId: param_ingredientId } = await params;
    const ingredientId = parseInt(param_ingredientId);
    if (isNaN(ingredientId)) {
      return NextResponse.json(
        { error: "Invalid ingredient ID" },
        { status: 400 }
      );
    }

    const query = "DELETE FROM ingredient WHERE IngredientId = ?";
    await executeQuery(query, [ingredientId]);

    return NextResponse.json(
      { message: "Inventory item deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory item" },
      { status: 500 }
    );
  }
}

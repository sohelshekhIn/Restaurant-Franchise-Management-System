import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db/config";

// Get all ingredients for a dish
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: dishId } = await params;
  const connection = await createConnection();

  try {
    const [ingredients] = await connection.execute(
      `SELECT i.IngredientId, i.IngredientName, i.Price
       FROM ingredient i
       WHERE i.DishId = ?
       ORDER BY i.IngredientName`,
      [dishId]
    );

    return NextResponse.json(ingredients, { status: 200 });
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredients" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

// Add a new ingredient to a dish
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: dishId } = await params;
  const connection = await createConnection();

  try {
    const body = await request.json();
    const { IngredientName, Price, MenuId } = body;

    // Start a transaction
    await connection.beginTransaction();

    // Get the next available IngredientId
    const [maxIdResult] = await connection.execute(
      "SELECT MAX(IngredientId) as maxId FROM ingredient"
    );
    const maxId = (maxIdResult as any[])[0].maxId || 0;
    const newIngredientId = maxId + 1;

    // Insert the new ingredient
    await connection.execute(
      `INSERT INTO ingredient (IngredientId, IngredientName, Price, MenuId, DishId)
       VALUES (?, ?, ?, ?, ?)`,
      [newIngredientId, IngredientName, Price, MenuId, dishId]
    );

    // Commit the transaction
    await connection.commit();

    return NextResponse.json(
      {
        message: "Ingredient added successfully",
        ingredientId: newIngredientId,
      },
      { status: 201 }
    );
  } catch (error) {
    // Rollback the transaction in case of error
    await connection.rollback();

    console.error("Error adding ingredient:", error);
    return NextResponse.json(
      { error: "Failed to add ingredient" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

// Delete an ingredient from a dish
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const dishId = params.id;
  const connection = await createConnection();

  try {
    const { searchParams } = new URL(request.url);
    const ingredientId = searchParams.get("ingredientId");

    if (!ingredientId) {
      return NextResponse.json(
        { error: "Ingredient ID is required" },
        { status: 400 }
      );
    }

    // Start a transaction
    await connection.beginTransaction();

    // Delete the ingredient
    await connection.execute(
      "DELETE FROM ingredient WHERE IngredientId = ? AND DishId = ?",
      [ingredientId, dishId]
    );

    // Commit the transaction
    await connection.commit();

    return NextResponse.json(
      { message: "Ingredient deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Rollback the transaction in case of error
    await connection.rollback();

    console.error("Error deleting ingredient:", error);
    return NextResponse.json(
      { error: "Failed to delete ingredient" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

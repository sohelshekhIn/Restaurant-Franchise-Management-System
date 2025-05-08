import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db/config";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const dishId = params.id;
  const connection = await createConnection();

  try {
    // Start a transaction to ensure data integrity
    await connection.beginTransaction();

    // First, delete all ingredients associated with this dish
    await connection.execute("DELETE FROM ingredient WHERE DishId = ?", [
      dishId,
    ]);

    // Then delete the dish itself
    await connection.execute("DELETE FROM dish WHERE DishId = ?", [dishId]);

    // Commit the transaction
    await connection.commit();

    return NextResponse.json(
      { message: "Dish deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Rollback the transaction in case of error
    await connection.rollback();

    console.error("Error deleting dish:", error);
    return NextResponse.json(
      { error: "Failed to delete dish" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const dishId = params.id;
  const connection = await createConnection();

  try {
    const body = await request.json();
    const { DishName, Description, Price } = body;

    // Start a transaction
    await connection.beginTransaction();

    // Update the dish
    await connection.execute(
      `UPDATE dish 
       SET DishName = ?, Description = ?, Price = ?
       WHERE DishId = ?`,
      [DishName, Description, Price, dishId]
    );

    // Commit the transaction
    await connection.commit();

    return NextResponse.json(
      { message: "Dish updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Rollback the transaction in case of error
    await connection.rollback();

    console.error("Error updating dish:", error);
    return NextResponse.json(
      { error: "Failed to update dish" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

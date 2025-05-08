// delete restaurant by id

import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db/config";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const connection = await createConnection();

  try {
    // Start transaction
    await connection.beginTransaction();

    // First get the TypeId from the restaurant
    const [restaurantResult] = await connection.execute(
      "SELECT RestaurantType_TypeId FROM Restaurant WHERE RestaurantId = ?",
      [id]
    );

    if (!(restaurantResult as any[]).length) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const typeId = (restaurantResult as any[])[0].RestaurantType_TypeId;

    try {
      // Delete from all tables that reference this restaurant
      // This handles all foreign key constraints in one place

      // 1. Delete from Address
      await connection.execute("DELETE FROM Address WHERE RestaurantId = ?", [
        id,
      ]);

      // 2. Delete from Employee
      await connection.execute("DELETE FROM Employee WHERE RestaurantId = ?", [
        id,
      ]);

      // 3. Delete from Sales
      await connection.execute("DELETE FROM Sales WHERE RestaurantId = ?", [
        id,
      ]);

      // 4. Delete from Revenue
      await connection.execute("DELETE FROM Revenue WHERE RestaurantId = ?", [
        id,
      ]);

      // 5. Delete from region table if any records reference this restaurant type
      await connection.execute("DELETE FROM region WHERE TypeId = ?", [typeId]);

      // 6. Delete from Restaurant
      await connection.execute(
        "DELETE FROM Restaurant WHERE RestaurantId = ?",
        [id]
      );

      // 7. Finally delete from RestaurantType1 if no other restaurants reference it
      const [remainingRestaurants] = await connection.execute(
        "SELECT COUNT(*) as count FROM Restaurant WHERE RestaurantType_TypeId = ?",
        [typeId]
      );

      if ((remainingRestaurants as any[])[0].count === 0) {
        await connection.execute(
          "DELETE FROM RestaurantType1 WHERE TypeId = ?",
          [typeId]
        );
      }

      // If all operations succeed, commit the transaction
      await connection.commit();
      return NextResponse.json({ message: "Restaurant deleted successfully" });
    } catch (error) {
      // If any operation fails, rollback all changes
      await connection.rollback();
      throw error; // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    return NextResponse.json(
      {
        error:
          "Failed to delete restaurant. All changes have been rolled back.",
      },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const connection = await createConnection();

  try {
    const body = await request.json();
    const {
      Name,
      Phone,
      RestaurantType_TypeId,
      Street,
      City,
      Province,
      Country,
      PostalCode,
    } = body;

    await connection.beginTransaction();

    try {
      // First get the current restaurant and address IDs
      const [restaurantResult] = await connection.execute(
        "SELECT AddressId FROM Restaurant WHERE RestaurantId = ?",
        [id]
      );

      if (!(restaurantResult as any[]).length) {
        await connection.rollback();
        return NextResponse.json(
          { error: "Restaurant not found" },
          { status: 404 }
        );
      }

      const addressId = (restaurantResult as any[])[0].AddressId;

      // Update the restaurant
      await connection.execute(
        `UPDATE Restaurant 
         SET Name = ?, Phone = ?, RestaurantType_TypeId = ?
         WHERE RestaurantId = ?`,
        [Name, Phone, RestaurantType_TypeId, id]
      );

      // Update the address
      await connection.execute(
        `UPDATE Address 
         SET Street = ?, City = ?, Province = ?, Country = ?, PostalCode = ?
         WHERE idAddress = ?`,
        [Street, City, Province, Country, PostalCode, addressId]
      );

      await connection.commit();
      return NextResponse.json({ message: "Restaurant updated successfully" });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error updating restaurant:", error);
    return NextResponse.json(
      { error: "Failed to update restaurant" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

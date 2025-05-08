import { NextResponse } from "next/server";
import { z } from "zod";
import { executeQuery } from "@/lib/db/db";
import { createConnection } from "@/lib/db/config";

// Schema for validating restaurant type data
const restaurantTypeSchema = z.object({
  TypeName: z.string().min(1, "Type name is required"),
  MenuId: z.number().min(1, "Menu ID is required"),
});

export async function PATCH(
  request: Request,
  { params }: { params: { typeId: string } }
) {
  try {
    const typeId = parseInt(params.typeId);

    if (isNaN(typeId)) {
      return NextResponse.json(
        { message: "Invalid restaurant type ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = restaurantTypeSchema.parse(body);

    // Check if the restaurant type exists
    const [existingType] = (await executeQuery(
      "SELECT TypeId FROM restauranttype1 WHERE TypeId = ?",
      [typeId]
    )) as any[];

    if (!existingType) {
      return NextResponse.json(
        { message: "Restaurant type not found" },
        { status: 404 }
      );
    }

    // Update the restaurant type
    await executeQuery(
      "UPDATE restauranttype1 SET TypeName = ?, MenuId = ? WHERE TypeId = ?",
      [validatedData.TypeName, validatedData.MenuId, typeId]
    );

    return NextResponse.json(
      { message: "Restaurant type updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating restaurant type:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update restaurant type" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { typeId: string } }
) {
  let connection;
  try {
    let { typeId: param_typeId } = await params;
    const typeId = parseInt(param_typeId);

    if (isNaN(typeId)) {
      return NextResponse.json(
        { message: "Invalid restaurant type ID" },
        { status: 400 }
      );
    }

    // Create a connection for transaction
    connection = await createConnection();

    // Start a transaction
    await connection.beginTransaction();

    try {
      // Check if the restaurant type exists
      const [existingType] = (await connection.execute(
        "SELECT TypeId FROM restauranttype1 WHERE TypeId = ?",
        [typeId]
      )) as any[];

      if (!existingType) {
        await connection.rollback();
        return NextResponse.json(
          { message: "Restaurant type not found" },
          { status: 404 }
        );
      }

      // Check if there are any restaurants using this type
      // Using the correct column name: RestaurantType_TypeId
      const [restaurants] = (await connection.execute(
        "SELECT COUNT(*) as count FROM restaurant WHERE RestaurantType_TypeId = ?",
        [typeId]
      )) as any[];

      if (restaurants.count > 0) {
        await connection.rollback();
        return NextResponse.json(
          {
            message: "Cannot delete restaurant type",
            details:
              "There are restaurants using this type. Please reassign or delete those restaurants first.",
          },
          { status: 400 }
        );
      }

      // Check if there are any regions using this type
      const [regions] = (await connection.execute(
        "SELECT COUNT(*) as count FROM region WHERE TypeId = ?",
        [typeId]
      )) as any[];

      if (regions.count > 0) {
        // Delete regions that reference this type
        await connection.execute("DELETE FROM region WHERE TypeId = ?", [
          typeId,
        ]);
      }

      // Temporarily disable foreign key checks
      await connection.execute("SET FOREIGN_KEY_CHECKS = 0");

      // Delete the restaurant type
      await connection.execute("DELETE FROM restauranttype1 WHERE TypeId = ?", [
        typeId,
      ]);

      // Re-enable foreign key checks
      await connection.execute("SET FOREIGN_KEY_CHECKS = 1");

      // Commit the transaction
      await connection.commit();

      return NextResponse.json(
        { message: "Restaurant type deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      // Rollback the transaction in case of error
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error deleting restaurant type:", error);
    return NextResponse.json(
      { message: "Failed to delete restaurant type" },
      { status: 500 }
    );
  } finally {
    // Close the connection
    if (connection) {
      await connection.end();
    }
  }
}

export async function GET(
  request: Request,
  { params }: { params: { typeId: string } }
) {
  try {
    const typeId = parseInt(params.typeId);

    if (isNaN(typeId)) {
      return NextResponse.json(
        { message: "Invalid restaurant type ID" },
        { status: 400 }
      );
    }

    // Fetch the restaurant type with menu name
    const [restaurantType] = (await executeQuery(
      `
      SELECT 
        rt.TypeId,
        rt.TypeName,
        rt.MenuId,
        m.MenuName
      FROM restauranttype1 rt
      LEFT JOIN menu m ON rt.MenuId = m.MenuId
      WHERE rt.TypeId = ?
    `,
      [typeId]
    )) as any[];

    if (!restaurantType) {
      return NextResponse.json(
        { message: "Restaurant type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurantType);
  } catch (error) {
    console.error("Error fetching restaurant type:", error);
    return NextResponse.json(
      { message: "Failed to fetch restaurant type" },
      { status: 500 }
    );
  }
}

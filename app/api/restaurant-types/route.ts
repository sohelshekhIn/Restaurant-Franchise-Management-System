import { NextResponse } from "next/server";
import { z } from "zod";
import { executeQuery } from "@/lib/db/db";
import { ResultSetHeader } from "mysql2";

// Schema for validating restaurant type data
const restaurantTypeSchema = z.object({
  TypeName: z.string().min(1, "Type name is required"),
  MenuId: z.number().min(1, "Menu ID is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = restaurantTypeSchema.parse(body);

    // First, get the maximum TypeId to generate a new one
    const [maxIdResult] = (await executeQuery(
      "SELECT MAX(TypeId) as maxId FROM restauranttype1"
    )) as any[];

    const newTypeId = (maxIdResult.maxId || 0) + 1;

    // Insert the new restaurant type with the generated TypeId
    const result = (await executeQuery(
      `INSERT INTO restauranttype1 (TypeId, TypeName, MenuId) VALUES (?, ?, ?)`,
      [newTypeId, validatedData.TypeName, validatedData.MenuId]
    )) as ResultSetHeader;

    return NextResponse.json(
      { message: "Restaurant type created successfully", typeId: newTypeId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating restaurant type:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create restaurant type" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Fetch all restaurant types with menu names and restaurant counts
    const result = await executeQuery(`
      SELECT 
        rt.TypeId,
        rt.TypeName,
        rt.MenuId,
        m.MenuName,
        COUNT(r.RestaurantId) as RestaurantCount
      FROM restauranttype1 rt
      LEFT JOIN menu m ON rt.MenuId = m.MenuId
      LEFT JOIN restaurant r ON rt.TypeId = r.TypeId
      GROUP BY rt.TypeId, rt.TypeName, rt.MenuId, m.MenuName
      ORDER BY rt.TypeName
    `);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching restaurant types:", error);
    return NextResponse.json(
      { message: "Failed to fetch restaurant types" },
      { status: 500 }
    );
  }
}

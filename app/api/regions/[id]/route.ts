import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db/db";
import { z } from "zod";

// Define types for database results
interface RegionRecord {
  RegionId: number;
  TypeId: number;
  RegionName: string;
  Popularity: string;
  TypeName: string;
}

interface QueryResult {
  rows?: RegionRecord[];
  insertId?: number;
}

// Schema for validating region data
const regionSchema = z.object({
  RegionName: z.string().min(1, "Region name is required"),
  TypeId: z.number().min(1, "Restaurant type is required"),
  Popularity: z.string().min(1, "Popularity is required"),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = (await executeQuery(
      `
      SELECT 
        r.RegionId,
        r.TypeId,
        r.RegionName,
        r.Popularity,
        rt.TypeName
      FROM region r
      JOIN restauranttype1 rt ON r.TypeId = rt.TypeId
      WHERE r.RegionId = ?
      `,
      [id]
    )) as QueryResult;

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ error: "Region not found" }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching region:", error);
    return NextResponse.json(
      { error: "Failed to fetch region" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate the request body
    const validatedData = regionSchema.parse(body);

    // Update the region record
    const result = (await executeQuery(
      `UPDATE region 
       SET RegionName = ?, TypeId = ?, Popularity = ?
       WHERE RegionId = ?`,
      [
        validatedData.RegionName,
        validatedData.TypeId,
        validatedData.Popularity,
        id,
      ]
    )) as QueryResult;

    return NextResponse.json({
      message: "Region updated successfully",
    });
  } catch (error) {
    console.error("Error updating region:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update region" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    console.log(id);

    // Check if the region exists
    const regionResult = (await executeQuery(
      `SELECT RegionId FROM region WHERE RegionId = ?`,
      [id]
    )) as { RegionId: number }[];

    if (!regionResult || regionResult.length === 0) {
      return NextResponse.json({ error: "Region not found" }, { status: 404 });
    }

    // Delete the region
    await executeQuery(`DELETE FROM region WHERE RegionId = ?`, [id]);

    return NextResponse.json({
      message: "Region deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting region:", error);
    return NextResponse.json(
      { error: "Failed to delete region" },
      { status: 500 }
    );
  }
}

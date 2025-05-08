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

export async function GET() {
  try {
    const result = (await executeQuery(`
      SELECT 
        r.RegionId,
        r.TypeId,
        r.RegionName,
        r.Popularity,
        rt.TypeName
      FROM region r
      JOIN restauranttype1 rt ON r.TypeId = rt.TypeId
      ORDER BY r.RegionName ASC
    `)) as QueryResult;

    return NextResponse.json({ data: result.rows || [] });
  } catch (error) {
    console.error("Error fetching region data:", error);
    return NextResponse.json(
      { error: "Failed to fetch region data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = regionSchema.parse(body);

    // Get the next RegionId value
    const idResult = (await executeQuery(`
      SELECT MAX(RegionId) as maxId FROM region
    `)) as { maxId: number }[];

    // Add null check for idResult.rows
    const maxId = idResult && idResult.length > 0 ? idResult[0].maxId : 0;
    const nextId = maxId + 1;

    // Insert the new region record
    const result = (await executeQuery(
      `INSERT INTO region (RegionId, TypeId, RegionName, Popularity) 
       VALUES (?, ?, ?, ?)`,
      [
        nextId,
        validatedData.TypeId,
        validatedData.RegionName,
        validatedData.Popularity,
      ]
    )) as QueryResult;

    return NextResponse.json(
      { message: "Region created successfully", id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating region:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create region" },
      { status: 500 }
    );
  }
}

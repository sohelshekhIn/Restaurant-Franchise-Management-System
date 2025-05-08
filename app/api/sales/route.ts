import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db/db";
import { z } from "zod";

// Define types for database results
interface SalesRecord {
  SalesId: number;
  RestaurantId: number;
  RestaurantName: string;
  Date: string;
  Amount: number;
}

interface QueryResult {
  rows?: SalesRecord[];
  insertId?: number;
}

// Schema for validating sales data
const salesSchema = z.object({
  RestaurantId: z.number().min(1, "Restaurant ID is required"),
  Date: z.string().min(1, "Date is required"),
  Amount: z.number().min(0, "Amount must be a positive number"),
});

export async function GET() {
  try {
    const query = `
      SELECT 
        s.SalesId,
        s.RestaurantId,
        s.Date,
        s.Amount,
        r.Name as RestaurantName
      FROM sales s
      JOIN restaurant r ON s.RestaurantId = r.RestaurantId
      ORDER BY s.Date DESC
    `;

    const result = await executeQuery(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = salesSchema.parse(body);

    const query = `
      INSERT INTO sales (
        RestaurantId,
        Date,
        Amount
      ) VALUES (?, ?, ?)
    `;

    const result = (await executeQuery(query, [
      validatedData.RestaurantId,
      validatedData.Date,
      validatedData.Amount,
    ])) as { insertId: number };

    return NextResponse.json(
      { message: "Sales record created successfully", id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating sales record:", error);
    return NextResponse.json(
      { error: "Failed to create sales record" },
      { status: 500 }
    );
  }
}

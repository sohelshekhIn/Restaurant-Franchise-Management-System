import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db/db";
import { z } from "zod";

// Define types for database results
interface RevenueRecord {
  idRevenue: number;
  RestaurantId: number;
  RestaurantName: string;
  Month: string;
  MonthlySale: number;
  MonthlyMaintenance: number;
  EmployeeSalaries: number;
  Profit: number;
}

interface QueryResult {
  rows: RevenueRecord[];
  insertId?: number;
}

// Schema for validating revenue data
const revenueSchema = z.object({
  RestaurantId: z.number().min(1, "Restaurant is required"),
  Month: z.string().min(1, "Month is required"),
  MonthlySale: z.number().min(0, "Monthly sale must be a positive number"),
  MonthlyMaintenance: z
    .number()
    .min(0, "Maintenance cost must be a positive number"),
  EmployeeSalaries: z
    .number()
    .min(0, "Employee salaries must be a positive number"),
});

export async function GET() {
  try {
    const result = (await executeQuery(`
      SELECT 
        r.idRevenue,
        r.RestaurantId,
        rest.Name as RestaurantName,
        r.Month,
        r.MonthlySale,
        r.MonthlyMaintenance,
        r.EmployeeSalaries,
        r.Profit
      FROM revenue r
      JOIN restaurant rest ON r.RestaurantId = rest.RestaurantId
      ORDER BY r.Month DESC, rest.Name ASC
    `)) as QueryResult;

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = revenueSchema.parse(body);

    // Calculate profit
    const profit =
      validatedData.MonthlySale -
      validatedData.MonthlyMaintenance -
      validatedData.EmployeeSalaries;

    // Get the next idRevenue value
    const idResult = (await executeQuery(`
      SELECT MAX(idRevenue) as maxId FROM revenue
    `)) as { rows?: { maxId: number }[] };

    // Add null check for idResult.rows
    const maxId =
      idResult.rows && idResult.rows.length > 0 ? idResult.rows[0].maxId : 0;
    const nextId = maxId + 1;

    // Insert the new revenue record
    const result = (await executeQuery(
      `INSERT INTO revenue (idRevenue, RestaurantId, Month, MonthlySale, MonthlyMaintenance, EmployeeSalaries, Profit) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nextId,
        validatedData.RestaurantId,
        validatedData.Month,
        validatedData.MonthlySale,
        validatedData.MonthlyMaintenance,
        validatedData.EmployeeSalaries,
        profit,
      ]
    )) as QueryResult;

    return NextResponse.json(
      { message: "Revenue record created successfully", id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating revenue record:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create revenue record" },
      { status: 500 }
    );
  }
}

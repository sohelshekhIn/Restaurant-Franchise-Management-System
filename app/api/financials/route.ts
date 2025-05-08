import { NextResponse } from "next/server";
import { z } from "zod";
import { executeQuery } from "@/lib/db/db";

// Define types for database results
interface RevenueRecord {
  RevenueId: number;
  RestaurantId: number;
  RestaurantName: string;
  Month: string;
  MonthlySale: number;
  MonthlyMaintenance: number;
  EmployeeSalaries: number;
  NetRevenue: number;
}

interface QueryResult {
  rows: RevenueRecord[];
  insertId?: number;
}

// Schema for validating revenue data
const revenueSchema = z.object({
  restaurantId: z.number({
    required_error: "Restaurant is required",
  }),
  month: z.string({
    required_error: "Month is required",
  }),
  monthlySale: z
    .number({
      required_error: "Monthly sale is required",
    })
    .min(0, "Monthly sale must be a positive number"),
  monthlyMaintenance: z
    .number({
      required_error: "Monthly maintenance is required",
    })
    .min(0, "Monthly maintenance must be a positive number"),
  employeeSalaries: z
    .number({
      required_error: "Employee salaries is required",
    })
    .min(0, "Employee salaries must be a positive number"),
});

// GET /api/financials
export async function GET() {
  try {
    const result = (await executeQuery(`
      SELECT 
        r.RevenueId,
        r.RestaurantId,
        rest.RestaurantName,
        r.Month,
        r.MonthlySale,
        r.MonthlyMaintenance,
        r.EmployeeSalaries,
        (r.MonthlySale - r.MonthlyMaintenance - r.EmployeeSalaries) as NetRevenue
      FROM revenue r
      JOIN restaurant rest ON r.RestaurantId = rest.RestaurantId
      ORDER BY r.Month DESC, rest.RestaurantName
    `)) as QueryResult;

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching revenue records:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue records" },
      { status: 500 }
    );
  }
}

// POST /api/financials
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = revenueSchema.parse(body);

    const result = (await executeQuery(
      `INSERT INTO revenue (
        RestaurantId, 
        Month, 
        MonthlySale, 
        MonthlyMaintenance, 
        EmployeeSalaries
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        validatedData.restaurantId,
        validatedData.month,
        validatedData.monthlySale,
        validatedData.monthlyMaintenance,
        validatedData.employeeSalaries,
      ]
    )) as QueryResult;

    return NextResponse.json({
      message: "Revenue record created successfully",
      revenueId: result.insertId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating revenue record:", error);
    return NextResponse.json(
      { error: "Failed to create revenue record" },
      { status: 500 }
    );
  }
}

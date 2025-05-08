import { NextResponse } from "next/server";
import { z } from "zod";
import { executeQuery } from "@/lib/db/db";

const departmentSchema = z.object({
  DepartmentName: z.string().min(1, "Department name is required"),
});

export async function GET() {
  try {
    const query = `
      SELECT 
        DepartmentId,
        DepartmentName
      FROM department
      ORDER BY DepartmentName ASC
    `;

    const result = await executeQuery(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = departmentSchema.parse(body);

    const query = `
      INSERT INTO department (
        DepartmentName
      ) VALUES (?)
    `;

    const result = (await executeQuery(query, [
      validatedData.DepartmentName,
    ])) as { insertId: number };

    return NextResponse.json(
      { message: "Department created successfully", id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating department:", error);
    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 }
    );
  }
}

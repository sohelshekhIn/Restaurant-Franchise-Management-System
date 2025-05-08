import { NextResponse } from "next/server";
import { z } from "zod";
import { executeQuery } from "@/lib/db/db";

const departmentSchema = z.object({
  DepartmentName: z.string().min(1, "Department name is required"),
});

export async function PATCH(
  request: Request,
  { params }: { params: { departmentId: string } }
) {
  try {
    const departmentId = parseInt(params.departmentId);
    if (isNaN(departmentId)) {
      return NextResponse.json(
        { error: "Invalid department ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = departmentSchema.parse(body);

    const query = `
      UPDATE department
      SET 
        DepartmentName = ?
      WHERE DepartmentId = ?
    `;

    await executeQuery(query, [validatedData.DepartmentName, departmentId]);

    return NextResponse.json(
      { message: "Department updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating department:", error);
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { departmentId: string } }
) {
  try {
    const departmentId = parseInt(params.departmentId);
    if (isNaN(departmentId)) {
      return NextResponse.json(
        { error: "Invalid department ID" },
        { status: 400 }
      );
    }

    // Check if there are any employees in this department
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM employee
      WHERE DepartmentId = ?
    `;

    const checkResult = (await executeQuery(checkQuery, [departmentId])) as {
      count: number;
    }[];

    if (checkResult[0].count > 0) {
      return NextResponse.json(
        { error: "Cannot delete department with associated employees" },
        { status: 400 }
      );
    }

    const query = "DELETE FROM department WHERE DepartmentId = ?";
    await executeQuery(query, [departmentId]);

    return NextResponse.json(
      { message: "Department deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    );
  }
}

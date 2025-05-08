import { NextResponse } from "next/server";
import * as z from "zod";
import { executeQuery } from "@/lib/db/db";

// Define the employee schema for validation
const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  monthlySalary: z.number().min(0, "Monthly salary must be a positive number"),
  joinDate: z.string().min(1, "Join date is required"),
  restaurantId: z.number().min(1, "Restaurant is required"),
  departmentId: z.number().min(1, "Department is required"),
  managerId: z.number().optional(),
});

// Define the Employee interface
interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  restaurantId: number;
  departmentId: number;
  monthlySalary: string;
  joinDate: string;
  managerId?: number;
}

// GET handler to fetch a single employee
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid employee ID" },
        { status: 400 }
      );
    }

    // Fetch the employee from the database
    const result = await executeQuery(
      `SELECT 
        e.EmployeeId, 
        e.firstName, 
        e.lastName, 
        e.MonthlySalary, 
        e.joinDate, 
        e.RestaurantId, 
        e.DepartmentId, 
        e.ManagerId,
        r.Name as restaurantName,
        d.DepartmentName as departmentName
      FROM employee e
      LEFT JOIN restaurant r ON e.RestaurantId = r.RestaurantId
      LEFT JOIN department d ON e.DepartmentId = d.DepartmentId
      WHERE e.EmployeeId = ?`,
      [id]
    );

    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const employee = result[0];

    return NextResponse.json({ employee }, { status: 200 });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee" },
      { status: 500 }
    );
  }
}

// PATCH handler to update an employee
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid employee ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = employeeSchema.parse(body);

    const result = await executeQuery(
      `UPDATE employee 
       SET FirstName = ?, LastName = ?, MonthlySalary = ?, JoinDate = ?, 
           RestaurantId = ?, DepartmentId = ?, ManagerId = ?
       WHERE EmployeeId = ?`,
      [
        validatedData.firstName,
        validatedData.lastName,
        validatedData.monthlySalary,
        validatedData.joinDate,
        validatedData.restaurantId,
        validatedData.departmentId,
        validatedData.managerId || null,
        id,
      ]
    );

    return NextResponse.json({ message: "Employee updated successfully" });
  } catch (error) {
    console.error("Error updating employee:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

// DELETE handler to delete an employee
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid employee ID" },
        { status: 400 }
      );
    }

    // Check if employee exists
    const checkResult = await executeQuery(
      "SELECT EmployeeId FROM employee WHERE EmployeeId = ?",
      [id]
    );

    if (!Array.isArray(checkResult) || checkResult.length === 0) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Check if the employee is a manager for other employees
    const managerCheck = await executeQuery(
      "SELECT COUNT(*) as count FROM employee WHERE ManagerId = ?",
      [id]
    );

    if (Array.isArray(managerCheck) && managerCheck[0].count > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete employee who is a manager for other employees",
        },
        { status: 400 }
      );
    }

    // Delete the employee from the database
    await executeQuery("DELETE FROM employee WHERE EmployeeId = ?", [id]);

    return NextResponse.json(
      { message: "Employee deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}

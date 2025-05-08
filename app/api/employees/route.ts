import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db/db";
import { z } from "zod";
import { createConnection } from "@/lib/db/config";

// Schema for employee data validation
const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  monthlySalary: z.number().min(0, "Salary must be a positive number"),
  joinDate: z.string().min(1, "Join date is required"),
  managerId: z.number().nullable().optional(),
  departmentId: z.number().min(1, "Department is required"),
  restaurantId: z.number().min(1, "Restaurant is required"),
});

// GET /api/employees
export async function GET() {
  try {
    const employees = await executeQuery(
      `
      SELECT 
        e.EmployeeId,
        e.firstName,
        e.lastName,
        e.MonthlySalary,
        e.joinDate,
        e.ManagerId,
        e.RestaurantId,
        e.DepartmentId,
        r.Name as restaurantName,
        d.DepartmentName as departmentName
      FROM employee e
      LEFT JOIN restaurant r ON e.RestaurantId = r.RestaurantId
      LEFT JOIN department d ON e.DepartmentId = d.DepartmentId
      ORDER BY e.lastName, e.firstName
      `
    );

    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

// POST /api/employees
export async function POST(request: Request) {
  const connection = await createConnection();

  try {
    const body = await request.json();
    const validatedData = employeeSchema.parse(body);

    // Start transaction
    await connection.beginTransaction();

    try {
      // Get the next available EmployeeId
      const [idResult] = await connection.execute(
        "SELECT MAX(EmployeeId) as maxId FROM employee"
      );
      const maxId = (idResult as any[])[0].maxId || 0;
      const newEmployeeId = maxId + 1;

      // Call the create_employee stored procedure
      await connection.execute(`CALL create_employee(?, ?, ?, ?, ?, ?, ?, ?)`, [
        newEmployeeId,
        validatedData.restaurantId,
        validatedData.firstName,
        validatedData.lastName,
        validatedData.monthlySalary,
        validatedData.joinDate,
        validatedData.managerId || null,
        validatedData.departmentId,
      ]);

      await connection.commit();

      return NextResponse.json(
        {
          message: "Employee created successfully",
          employeeId: newEmployeeId,
        },
        { status: 201 }
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating employee:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

import { executeQuery } from "@/lib/db/db";
import { EmployeeEditForm } from "@/components/employees/employee-edit-form";
import { notFound } from "next/navigation";
import { Restaurant, Department } from "@/lib/db/types";

interface PageProps {
  params: {
    id: string;
  };
}

interface Employee {
  EmployeeId: number;
  firstName: string;
  lastName: string;
  monthlySalary: number;
  joinDate: string;
  restaurantId: number;
  departmentId: number;
  managerId?: number;
}

interface Manager {
  EmployeeId: number;
  firstName: string;
  lastName: string;
}

export default async function EditEmployeePage({ params }: PageProps) {
  const employeeId = parseInt(params.id);

  try {
    // Fetch employee data
    const [employeeResult] = (await executeQuery(
      `SELECT 
        e.EmployeeId,
        e.firstName,
        e.lastName,
        e.MonthlySalary,
        e.joinDate,
        e.RestaurantId,
        e.DepartmentId,
        e.ManagerId
      FROM employee e
      WHERE e.EmployeeId = ?`,
      [employeeId]
    )) as any[];

    if (!employeeResult) {
      notFound();
    }

    // Convert the employee data to match the expected interface
    const employee: Employee = {
      EmployeeId: employeeResult.EmployeeId,
      firstName: employeeResult.firstName || "",
      lastName: employeeResult.lastName || "",
      monthlySalary: parseFloat(employeeResult.MonthlySalary) || 0,
      joinDate: employeeResult.joinDate
        ? new Date(employeeResult.joinDate).toISOString().split("T")[0]
        : "",
      restaurantId: employeeResult.RestaurantId,
      departmentId: employeeResult.DepartmentId,
      managerId: employeeResult.ManagerId || undefined,
    };

    // Fetch restaurants
    const restaurants = (await executeQuery(
      `SELECT RestaurantId, Name, TypeId, Phone, AddressId, RestaurantType_TypeId FROM restaurant`
    )) as Restaurant[];

    // Fetch departments
    const departments = (await executeQuery(
      `SELECT DepartmentId, DepartmentName FROM department`
    )) as Department[];

    // Fetch potential managers (all employees except current one)
    const managerResults = (await executeQuery(
      `SELECT 
        EmployeeId,
        firstName,
        lastName
      FROM employee 
      WHERE EmployeeId != ?`,
      [employeeId]
    )) as any[];

    // Convert manager data to match the expected interface
    const managers: Employee[] = managerResults.map((manager) => ({
      EmployeeId: manager.EmployeeId,
      firstName: manager.firstName || "",
      lastName: manager.lastName || "",
      monthlySalary: 0,
      joinDate: "",
      restaurantId: 0,
      departmentId: 0,
      managerId: undefined,
    }));

    return (
      <EmployeeEditForm
        employee={employee}
        restaurants={restaurants}
        departments={departments}
        managers={managers}
        isLoading={false}
        error={null}
      />
    );
  } catch (error) {
    console.error("Error fetching employee data:", error);
    return (
      <EmployeeEditForm
        employee={null}
        restaurants={[]}
        departments={[]}
        managers={[]}
        isLoading={false}
        error="Failed to load employee data"
      />
    );
  }
}

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmployeeTable } from "@/components/employees/employee-table";
import { executeQuery } from "@/lib/db/db";
import { Department, Employee, Restaurant } from "@/lib/db/types";
import type { Metadata } from "next";

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Employees | Restaurant Management System",
  description: "Manage your employees",
};

export default async function EmployeesPage() {
  // Fetch restaurants and departments from the database
  const restaurants = (await executeQuery(
    "SELECT RestaurantId, Name, TypeId, Phone, AddressId, RestaurantType_TypeId FROM restaurant ORDER BY Name"
  )) as Restaurant[];

  const departments = (await executeQuery(
    "SELECT DepartmentId, DepartmentName FROM department ORDER BY DepartmentName"
  )) as Department[];

  const employees = (await executeQuery(
    "SELECT EmployeeId, firstName, lastName, MonthlySalary, joinDate, RestaurantId, DepartmentId, ManagerId FROM employee ORDER BY firstName"
  )) as Employee[];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employees</h1>
        <Link href="/employees/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </Link>
      </div>

      <EmployeeTable
        employees={employees}
        restaurants={restaurants}
        departments={departments}
      />
    </div>
  );
}

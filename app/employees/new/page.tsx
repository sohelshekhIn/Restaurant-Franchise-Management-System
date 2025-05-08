import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmployeeEditForm } from "@/components/employees/employee-edit-form";
import { Department, Restaurant } from "@/lib/db/types";

import { executeQuery } from "@/lib/db/db";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const [restaurants, departments] = await Promise.all([
      executeQuery(`
        SELECT RestaurantId, Name
        FROM restaurant
        ORDER BY Name
      `),
      executeQuery(`
        SELECT DepartmentId, DepartmentName
        FROM department
        ORDER BY DepartmentName
      `),
    ]);

    return {
      restaurants: restaurants as Restaurant[],
      departments: departments as Department[],
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch required data");
  }
}

export default async function NewEmployeePage() {
  const { restaurants, departments } = await getData();

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Link href="/employees">
          <Button variant="ghost" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Employee</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <EmployeeEditForm
          employee={null}
          restaurants={restaurants}
          departments={departments}
          managers={[]}
          isLoading={false}
          error={null}
        />
      </div>
    </div>
  );
}

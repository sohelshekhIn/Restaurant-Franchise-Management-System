"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Department, Employee as DbEmployee, Restaurant } from "@/lib/db/types";

// Extend the DB Employee type with additional properties
interface Employee extends DbEmployee {
  restaurantName?: string;
  departmentName?: string;
}

export function EmployeeTable({
  employees,
  restaurants,
  departments,
}: {
  employees: Employee[];
  restaurants: Restaurant[];
  departments: Department[];
}) {
  const router = useRouter();
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);

  // Initialize filtered employees with the data from props
  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  // Filter employees based on search query and selected filters
  useEffect(() => {
    const filtered = employees.filter((employee) => {
      // Find the restaurant and department names for this employee
      const restaurant = restaurants.find(
        (r) => r.RestaurantId === employee.RestaurantId
      );
      const department = departments.find(
        (d) => d.DepartmentId === employee.DepartmentId
      );

      const matchesSearch =
        searchQuery === "" ||
        `${employee.firstName || ""} ${employee.lastName || ""}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (restaurant?.Name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (department?.DepartmentName || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesRestaurant =
        selectedRestaurant === "" ||
        selectedRestaurant === "all-restaurants" ||
        restaurant?.Name === selectedRestaurant;

      const matchesDepartment =
        selectedDepartment === "" ||
        selectedDepartment === "all-departments" ||
        department?.DepartmentName === selectedDepartment;

      return matchesSearch && matchesRestaurant && matchesDepartment;
    });

    setFilteredEmployees(filtered);
  }, [
    employees,
    searchQuery,
    selectedRestaurant,
    selectedDepartment,
    restaurants,
    departments,
  ]);

  const handleEdit = (employeeId: number) => {
    router.push(`/employees/${employeeId}/edit`);
  };

  const handleDelete = async (employeeId: number) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete employee");
      }

      toast.success("Employee deleted successfully");
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete employee"
      );
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="col-span-1">
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="col-span-1">
          <Select
            value={selectedRestaurant}
            onValueChange={setSelectedRestaurant}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by restaurant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-restaurants">All Restaurants</SelectItem>
              {restaurants.map((restaurant) => (
                <SelectItem
                  key={restaurant.RestaurantId}
                  value={restaurant.Name || ""}
                >
                  {restaurant.Name || "Unknown Restaurant"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-1">
          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-departments">All Departments</SelectItem>
              {departments.map((department) => (
                <SelectItem
                  key={department.DepartmentId}
                  value={department.DepartmentName || ""}
                >
                  {department.DepartmentName || "Unknown Department"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead>Restaurant</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No employees found
              </TableCell>
            </TableRow>
          ) : (
            filteredEmployees.map((employee) => {
              // Find the restaurant and department for this employee
              const restaurant = restaurants.find(
                (r) => r.RestaurantId === employee.RestaurantId
              );
              const department = departments.find(
                (d) => d.DepartmentId === employee.DepartmentId
              );
              const manager = employee.ManagerId
                ? employees.find((e) => e.EmployeeId === employee.ManagerId)
                : null;

              return (
                <TableRow key={employee.EmployeeId}>
                  <TableCell>
                    {employee.firstName || ""} {employee.lastName || ""}
                  </TableCell>
                  <TableCell>${employee.MonthlySalary || "0"}</TableCell>
                  <TableCell>
                    {employee.joinDate
                      ? new Date(employee.joinDate).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {restaurant?.Name || "Unknown Restaurant"}
                  </TableCell>
                  <TableCell>
                    {department?.DepartmentName || "Unknown Department"}
                  </TableCell>
                  <TableCell>
                    {manager
                      ? `${manager.firstName || ""} ${manager.lastName || ""}`
                      : "None"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(employee.EmployeeId)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEmployeeToDelete(employee.EmployeeId);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              employee.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (employeeToDelete) {
                  handleDelete(employeeToDelete);
                  setDeleteDialogOpen(false);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Employee as DbEmployee } from "@/lib/db/types";

interface Employee extends DbEmployee {
  RestaurantName: string;
  DepartmentName: string;
  ManagerName: string | null;
}

interface Restaurant {
  RestaurantId: number;
  Name: string;
}

interface Department {
  DepartmentId: number;
  DepartmentName: string | null;
}

interface EmployeeReportProps {
  EmployeeId: number;
  RestaurantId: number;
  DepartmentId: number;
  MonthlySalary: number;
  joinDate: string;
  RestaurantName: string;
  firstName: string;
  lastName: string;
  ManagerName: string | null;
  DepartmentName: string;
}

export function EmployeeReport({
  restaurants,
  employees,
  departments,
}: {
  restaurants: Restaurant[];
  employees: EmployeeReportProps[];
  departments: Department[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [filteredEmployees, setFilteredEmployees] =
    useState<EmployeeReportProps[]>(employees);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let filtered = employees;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (employee) =>
          employee.firstName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.RestaurantName.toLowerCase().includes(
            searchTerm.toLowerCase()
          ) ||
          employee.DepartmentName?.toLowerCase().includes(
            searchTerm.toLowerCase()
          )
      );
    }

    // Filter by restaurant
    if (selectedRestaurant) {
      filtered = filtered.filter(
        (employee) => employee.RestaurantId.toString() === selectedRestaurant
      );
    }

    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter(
        (employee) => employee.DepartmentId.toString() === selectedDepartment
      );
    }

    setFilteredEmployees(filtered);
  }, [searchTerm, selectedRestaurant, selectedDepartment, employees]);

  const handleExportCSV = () => {
    const headers = [
      "Employee ID",
      "Name",
      "Restaurant",
      "Department",
      "Salary",
      "Join Date",
      "Manager",
    ];

    const csvData = filteredEmployees.map((employee) => [
      employee.EmployeeId,
      `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
      employee.RestaurantName,
      employee.DepartmentName,
      employee.MonthlySalary,
      employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : "",
      employee.ManagerName || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "employee_report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading employee data...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search by name, restaurant, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select
            value={selectedRestaurant}
            onValueChange={setSelectedRestaurant}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select restaurant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Restaurants</SelectItem>
              {restaurants.map((restaurant) => (
                <SelectItem
                  key={restaurant.RestaurantId}
                  value={restaurant.RestaurantId.toString()}
                >
                  {restaurant.Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((department) => (
                <SelectItem
                  key={department.DepartmentId}
                  value={department.DepartmentId.toString()}
                >
                  {department.DepartmentName || "N/A"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Manager</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No employee data found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.EmployeeId}>
                    <TableCell>{employee.EmployeeId}</TableCell>
                    <TableCell>{`${employee.firstName || ""} ${
                      employee.lastName || ""
                    }`}</TableCell>
                    <TableCell>{employee.RestaurantName}</TableCell>
                    <TableCell>{employee.DepartmentName || "N/A"}</TableCell>
                    <TableCell>${employee.MonthlySalary}</TableCell>
                    <TableCell>
                      {employee.joinDate
                        ? new Date(employee.joinDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>{employee.ManagerName || "N/A"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

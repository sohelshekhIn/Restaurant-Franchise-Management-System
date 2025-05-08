import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChefHat, DollarSign, Home, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RevenueChart from "@/components/dashboard/revenue-chart";
import TopRestaurants from "@/components/dashboard/top-restaurants";
import PopularCuisines from "@/components/dashboard/popular-cuisines";
import EmployeeDistribution from "@/components/dashboard/employee-distribution";
import { executeQuery } from "@/lib/db/db";

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Restaurant Management System",
  description:
    "A comprehensive system for managing restaurants, menus, employees, and finances",
};

async function getDashboardData() {
  try {
    // Get total restaurants count
    const restaurantsResult = (await executeQuery(
      "SELECT COUNT(*) as count FROM restaurant"
    )) as { count: number }[];
    const totalRestaurants = restaurantsResult[0]?.count || 0;

    // Get total revenue from the most recent month
    const revenueResult = (await executeQuery(`
      SELECT SUM(MonthlySale) as totalRevenue 
      FROM revenue 
      WHERE Month = (SELECT MAX(Month) FROM revenue)
    `)) as { totalRevenue: number }[];
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Get previous month's revenue for comparison
    const prevMonthResult = (await executeQuery(`
      SELECT SUM(MonthlySale) as prevMonthRevenue 
      FROM revenue 
      WHERE Month = (
        SELECT MAX(Month) 
        FROM revenue 
        WHERE Month < (SELECT MAX(Month) FROM revenue)
      )
    `)) as { prevMonthRevenue: number }[];
    const prevMonthRevenue = prevMonthResult[0]?.prevMonthRevenue || 0;
    const revenueChange = prevMonthRevenue
      ? (((totalRevenue - prevMonthRevenue) / prevMonthRevenue) * 100).toFixed(
          1
        )
      : 0;

    // Get total employees count
    const employeesResult = (await executeQuery(
      "SELECT COUNT(*) as count FROM employee"
    )) as { count: number }[];
    const totalEmployees = employeesResult[0]?.count || 0;

    // Get previous month's employee count for comparison
    const prevMonthEmployeesResult = (await executeQuery(`
      SELECT COUNT(*) as count 
      FROM employee 
      WHERE joinDate < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    `)) as { count: number }[];
    const prevMonthEmployees = prevMonthEmployeesResult[0]?.count || 0;
    const employeeChange = totalEmployees - prevMonthEmployees;

    // Get popular cuisine type
    const popularCuisineResult = (await executeQuery(`
      SELECT rt.TypeName, COUNT(r.RestaurantId) as count
      FROM restaurant r
      JOIN restauranttype1 rt ON r.TypeId = rt.TypeId
      GROUP BY rt.TypeId, rt.TypeName
      ORDER BY count DESC
      LIMIT 1
    `)) as { TypeName: string; count: number }[];
    const popularCuisine = popularCuisineResult[0]?.TypeName || "No data";

    // Get revenue data for chart
    const revenueDataResult = (await executeQuery(`
      SELECT Month, SUM(MonthlySale) as totalSales
      FROM revenue
      GROUP BY Month
      ORDER BY Month
      LIMIT 12
    `)) as { Month: string; totalSales: number }[];

    // Get top performing restaurants
    const topRestaurantsResult = (await executeQuery(`
      SELECT r.Name, SUM(rev.MonthlySale) as totalSales
      FROM restaurant r
      JOIN revenue rev ON r.RestaurantId = rev.RestaurantId
      WHERE rev.Month = (SELECT MAX(Month) FROM revenue)
      GROUP BY r.RestaurantId, r.Name
      ORDER BY totalSales DESC
      LIMIT 5
    `)) as { Name: string; totalSales: number }[];

    // Get cuisine distribution by region
    const cuisineDistributionResult = (await executeQuery(`
      SELECT rt.TypeName, reg.RegionName, COUNT(r.RestaurantId) as count
      FROM restaurant r
      JOIN restauranttype1 rt ON r.TypeId = rt.TypeId
      JOIN region reg ON rt.TypeId = reg.TypeId
      GROUP BY rt.TypeId, rt.TypeName, reg.RegionId, reg.RegionName
      ORDER BY count DESC
    `)) as { TypeName: string; RegionName: string; count: number }[];

    // Get employee distribution by department
    const employeeDistributionResult = (await executeQuery(`
      SELECT d.DepartmentName, COUNT(e.EmployeeId) as count
      FROM department d
      LEFT JOIN employee e ON d.DepartmentId = e.DepartmentId
      GROUP BY d.DepartmentId, d.DepartmentName
      ORDER BY count DESC
    `)) as { DepartmentName: string; count: number }[];

    return {
      totalRestaurants,
      totalRevenue,
      revenueChange,
      totalEmployees,
      employeeChange,
      popularCuisine,
      revenueData: revenueDataResult,
      topRestaurants: topRestaurantsResult,
      cuisineDistribution: cuisineDistributionResult,
      employeeDistribution: employeeDistributionResult,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      totalRestaurants: 0,
      totalRevenue: 0,
      revenueChange: 0,
      totalEmployees: 0,
      employeeChange: 0,
      popularCuisine: "No data",
      revenueData: [],
      topRestaurants: [],
      cuisineDistribution: [],
      employeeDistribution: [],
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1">
        <section className="w-full py-6 md:py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
              <div className="flex-1 space-y-4">
                <h1 className="inline-block text-4xl font-bold tracking-tight lg:text-5xl">
                  Dashboard
                </h1>
                <p className="text-xl text-muted-foreground">
                  Overview of your restaurant management system
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Restaurants
                  </CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.totalRestaurants}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active locations
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${data.totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Number(data.revenueChange) > 0 ? "+" : ""}
                    {data.revenueChange}% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Employees
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.totalEmployees}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.employeeChange > 0 ? "+" : ""}
                    {data.employeeChange} from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Popular Cuisine
                  </CardTitle>
                  <ChefHat className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.popularCuisine}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on restaurant count
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>
                    Monthly revenue across all restaurants
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <RevenueChart data={data.revenueData} />
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Top Performing Restaurants</CardTitle>
                  <CardDescription>Based on monthly revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopRestaurants data={data.topRestaurants} />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Popular Cuisines by Region</CardTitle>
                  <CardDescription>Distribution across regions</CardDescription>
                </CardHeader>
                <CardContent>
                  <PopularCuisines data={data.cuisineDistribution} />
                </CardContent>
              </Card>
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Employee Distribution</CardTitle>
                  <CardDescription>Across departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployeeDistribution data={data.employeeDistribution} />
                </CardContent>
              </Card>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Management</CardTitle>
                  <CardDescription>
                    Manage your restaurant details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Add, edit, or remove restaurants. Update information such as
                    name, cuisine type, phone, and address.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/restaurants" className="w-full">
                    <Button className="w-full">
                      View Restaurants
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Menu & Dish Management</CardTitle>
                  <CardDescription>
                    Manage your menus and dishes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Create and manage menus for your restaurants. Add, edit, or
                    remove dishes and their ingredients.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/menus" className="w-full">
                    <Button className="w-full">
                      View Menus & Dishes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Employee Management</CardTitle>
                  <CardDescription>Manage your staff</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Add, edit, or remove employees. Update information such as
                    salary, department, and reporting structure.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/employees" className="w-full">
                    <Button className="w-full">
                      View Employees
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

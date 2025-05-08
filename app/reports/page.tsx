import { executeQuery } from "@/lib/db/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesReport } from "@/components/reports/sales-report";
import { RevenueReport } from "@/components/reports/revenue-report";
import { EmployeeReport } from "@/components/reports/employee-report";
import { InventoryReport } from "@/components/reports/inventory-report";
import { Department } from "@/lib/db/types";

interface Menu {
  MenuId: number;
  MenuName: string;
}

interface Dish {
  DishId: number;
  DishName: string;
}

export const dynamic = "force-dynamic";
export default async function ReportsPage() {
  // Fetch summary data for the dashboard
  const summaryData = await fetchSummaryData();
  const restaurants = await fetchRestaurants();
  const sales = await fetchSales();
  const revenues = await fetchRevenues();
  const employees = await fetchEmployees();

  const departments = await fetchDepartments();
  const menus = await fetchMenus();
  const dishes = await fetchDishes();
  const inventoryItems = await fetchInventoryItem();

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Restaurants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData.totalRestaurants}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summaryData.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData.totalEmployees}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Dishes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalDishes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Report</TabsTrigger>
          <TabsTrigger value="employee">Employee Report</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <SalesReport restaurants={restaurants} sales={sales} />
        </TabsContent>
        <TabsContent value="revenue">
          <RevenueReport restaurants={restaurants} revenues={revenues} />
        </TabsContent>
        <TabsContent value="employee">
          <EmployeeReport
            restaurants={restaurants}
            employees={employees}
            departments={departments}
          />
        </TabsContent>
        <TabsContent value="inventory">
          <InventoryReport
            inventory={inventoryItems}
            menus={menus}
            dishes={dishes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function fetchMenus() {
  try {
    const menusResult = (await executeQuery(
      "SELECT MenuId, MenuName FROM menu ORDER BY MenuName ASC"
    )) as Menu[];

    return menusResult;
  } catch (error) {
    console.error("Error fetching menus:", error);
    return [];
  }
}

async function fetchDishes() {
  try {
    const dishesResult = (await executeQuery(
      "SELECT DishId, DishName FROM dish ORDER BY DishName ASC"
    )) as Dish[];
    return dishesResult;
  } catch (error) {
    console.error("Error fetching dishes:", error);
    return [];
  }
}

async function fetchInventoryItem() {
  try {
    const ingredientsResult = (await executeQuery(`
      SELECT 
        i.IngredientId,
        i.MenuId,
        i.DishId,
        i.IngredientName,
        i.Price,
        d.DishName,
        m.MenuName
      FROM ingredient i
      LEFT JOIN dish d ON i.DishId = d.DishId
      LEFT JOIN menu m ON i.MenuId = m.MenuId
      ORDER BY i.IngredientName ASC
    `)) as {
      IngredientId: number;
      MenuId: number;
      DishId: number;
      IngredientName: string;
      Price: number;
      DishName: string;
      MenuName: string;
    }[];
    return ingredientsResult;
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return [];
  }
}

async function fetchDepartments() {
  try {
    const departmentsResult = (await executeQuery(
      "SELECT DepartmentId, DepartmentName FROM department ORDER BY DepartmentName ASC"
    )) as Department[];
    return departmentsResult;
  } catch (error) {
    console.error("Error fetching departments:", error);

    return [];
  }
}

async function fetchEmployees() {
  try {
    const employeesResult = (await executeQuery(`
      SELECT 
        e.EmployeeId,
        e.RestaurantId,
        e.DepartmentId,
        e.MonthlySalary,
        e.joinDate,
        e.firstName,
        e.lastName,
        e.ManagerId,
        r.Name as RestaurantName,
        d.DepartmentName,
        CONCAT(m.firstName, ' ', m.lastName) as ManagerName
      FROM employee e
      JOIN restaurant r ON e.RestaurantId = r.RestaurantId
      JOIN department d ON e.DepartmentId = d.DepartmentId
      LEFT JOIN employee m ON e.ManagerId = m.EmployeeId
    `)) as {
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
    }[];
    return employeesResult;
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
}

async function fetchRevenues() {
  try {
    const revenuesResult = (await executeQuery(`
      SELECT r.*, res.Name as RestaurantName 
      FROM revenue r
      JOIN restaurant res ON r.RestaurantId = res.RestaurantId
    `)) as {
      idRevenue: number;
      RestaurantId: number;
      Month: string;
      MonthlySale: number;
      MonthlyMaintenance: number;
      EmployeeSalaries: number;
      Profit: number;
      RestaurantName: string;
    }[];
    return revenuesResult;
  } catch (error) {
    console.error("Error fetching revenues:", error);
    return [];
  }
}

async function fetchRestaurants() {
  try {
    const restaurantsResult = (await executeQuery(
      "SELECT RestaurantId, Name FROM restaurant ORDER BY Name ASC"
    )) as { RestaurantId: number; Name: string }[];

    return restaurantsResult;
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return [];
  }
}

async function fetchSales() {
  try {
    const salesResult = (await executeQuery(`
      SELECT s.*, r.Name as RestaurantName 
      FROM sales s
      JOIN restaurant r ON s.RestaurantId = r.RestaurantId
    `)) as {
      SalesId: number;
      RestaurantId: number;
      Date: string;
      Amount: number;
      RestaurantName: string;
    }[];
    return salesResult;
  } catch (error) {
    console.error("Error fetching sales:", error);
    return [];
  }
}

async function fetchSummaryData() {
  try {
    // Fetch total restaurants
    const restaurantsResult = (await executeQuery(
      "SELECT COUNT(*) as count FROM restaurant"
    )) as { count: number }[];
    const totalRestaurants = restaurantsResult[0]?.count || 0;

    // Fetch total revenue
    const revenueResult = (await executeQuery(
      "SELECT SUM(MonthlySale) as total FROM revenue"
    )) as { total: number }[];
    const totalRevenue = revenueResult[0]?.total || 0;

    // Fetch total employees
    const employeesResult = (await executeQuery(
      "SELECT COUNT(*) as count FROM employee"
    )) as { count: number }[];
    const totalEmployees = employeesResult[0]?.count || 0;

    // Fetch total dishes
    const dishesResult = (await executeQuery(
      "SELECT COUNT(*) as count FROM dish"
    )) as { count: number }[];
    const totalDishes = dishesResult[0]?.count || 0;

    return {
      totalRestaurants,
      totalRevenue,
      totalEmployees,
      totalDishes,
    };
  } catch (error) {
    console.error("Error fetching summary data:", error);
    return {
      totalRestaurants: 0,
      totalRevenue: 0,
      totalEmployees: 0,
      totalDishes: 0,
    };
  }
}

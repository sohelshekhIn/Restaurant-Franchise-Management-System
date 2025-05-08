import { createConnection } from "@/lib/db/config";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function getRestaurantDetails(id: string) {
  const connection = await createConnection();
  try {
    // Get restaurant basic info with address and type name
    const [restaurantResult] = await connection.execute(
      `SELECT r.*, a.Street, a.City, a.Province, a.Country, a.PostalCode, rt.TypeName
       FROM Restaurant r
       LEFT JOIN Address a ON r.AddressId = a.idAddress
       LEFT JOIN RestaurantType1 rt ON r.RestaurantType_TypeId = rt.TypeId
       WHERE r.RestaurantId = ?`,
      [id]
    );

    if (!(restaurantResult as any[]).length) {
      return null;
    }

    const restaurant = (restaurantResult as any[])[0];

    // Get employees
    const [employeesResult] = await connection.execute(
      `SELECT e.*, d.DepartmentName
       FROM Employee e
       LEFT JOIN department d ON e.DepartmentId = d.DepartmentId
       WHERE e.RestaurantId = ?`,
      [id]
    );

    // Get sales data
    const [salesResult] = await connection.execute(
      `SELECT * FROM Sales WHERE RestaurantId = ? ORDER BY Date DESC LIMIT 10`,
      [id]
    );

    // Get revenue data
    const [revenueResult] = await connection.execute(
      `SELECT * FROM Revenue WHERE RestaurantId = ? ORDER BY Month DESC LIMIT 12`,
      [id]
    );

    // Get menu and dishes
    const [menuResult] = await connection.execute(
      `SELECT m.*, d.DishId, d.DishName, d.Description, d.Price
       FROM menu m
       LEFT JOIN dish d ON m.MenuId = d.MenuId
       WHERE m.MenuId IN (
         SELECT MenuId FROM RestaurantType1 WHERE TypeId = ?
       )`,
      [restaurant.RestaurantType_TypeId]
    );

    return {
      ...restaurant,
      employees: employeesResult as any[],
      sales: salesResult as any[],
      revenue: revenueResult as any[],
      menu: menuResult as any[],
    };
  } finally {
    await connection.end();
  }
}

export default async function RestaurantPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const restaurant = await getRestaurantDetails(id);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/restaurants">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{restaurant.Name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Type</h3>
              <p>{restaurant.TypeName || "Not specified"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Phone</h3>
              <p>{restaurant.Phone}</p>
            </div>
            <div>
              <h3 className="font-semibold">Address</h3>
              <p>
                {restaurant.Street}, {restaurant.City}
                <br />
                {restaurant.Province}, {restaurant.Country}
                <br />
                {restaurant.PostalCode}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Maintenance</TableHead>
                  <TableHead>Salaries</TableHead>
                  <TableHead>Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {restaurant.revenue.map((rev: any) => (
                  <TableRow key={rev.idRevenue}>
                    <TableCell>{rev.Month}</TableCell>
                    <TableCell>${rev.MonthlySale}</TableCell>
                    <TableCell>${rev.MonthlyMaintenance}</TableCell>
                    <TableCell>${rev.EmployeeSalaries}</TableCell>
                    <TableCell>${rev.Profit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="sales">Recent Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Salary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurant.employees.map((emp: any) => (
                    <TableRow key={emp.EmployeeId}>
                      <TableCell>
                        {emp.firstName} {emp.lastName}
                      </TableCell>
                      <TableCell>{emp.DepartmentName}</TableCell>
                      <TableCell>
                        {new Date(emp.joinDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${emp.MonthlySalary}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu">
          <Card>
            <CardHeader>
              <CardTitle>Menu</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dish Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurant.menu.map((dish: any) => (
                    <TableRow key={dish.DishId}>
                      <TableCell>{dish.DishName}</TableCell>
                      <TableCell>{dish.Description}</TableCell>
                      <TableCell>${dish.Price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurant.sales.map((sale: any) => (
                    <TableRow key={sale.SalesId}>
                      <TableCell>
                        {new Date(sale.Date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${sale.Amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

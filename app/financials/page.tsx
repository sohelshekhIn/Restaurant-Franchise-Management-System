import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueTable } from "@/components/financials/revenue-table";
import { SalesTable } from "@/components/financials/sales-table";
import { executeQuery } from "@/lib/db/db";

interface Revenue {
  idRevenue: number;
  RestaurantId: number;
  RestaurantName: string;
  Month: string;
  MonthlySale: number;
  MonthlyMaintenance: number;
  EmployeeSalaries: number;
  Profit: number;
}

interface Sale {
  SalesId: number;
  RestaurantId: number;
  RestaurantName: string;
  Date: string;
  Amount: number;
}

interface Restaurant {
  id: number;
  name: string;
}

export const metadata: Metadata = {
  title: "Financials | Restaurant Management System",
  description: "Manage your financial data",
};

export const dynamic = "force-dynamic";

export default async function FinancialsPage() {
  // Fetch revenue data from the database
  const revenues = (await executeQuery(`
    SELECT 
      r.idRevenue,
      r.RestaurantId,
      rest.Name as RestaurantName,
      r.Month,
      r.MonthlySale,
      r.MonthlyMaintenance,
      r.EmployeeSalaries,
      r.Profit
    FROM revenue r
    JOIN restaurant rest ON r.RestaurantId = rest.RestaurantId
    ORDER BY r.Month DESC, rest.Name ASC
  `)) as Revenue[];

  // Fetch sales data from the database
  const sales = (await executeQuery(`
    SELECT 
      s.SalesId,
      s.RestaurantId,
      rest.Name as RestaurantName,
      s.Date,
      s.Amount
    FROM sales s
    JOIN restaurant rest ON s.RestaurantId = rest.RestaurantId
    ORDER BY s.Date DESC, rest.Name ASC
  `)) as Sale[];

  // Get unique restaurants and months for filters
  const restaurants = Array.from(
    new Set(revenues.map((revenue) => revenue.RestaurantId))
  ).map((id) => ({
    id,
    name: revenues.find((r) => r.RestaurantId === id)?.RestaurantName || "",
  }));

  const months = Array.from(new Set(revenues.map((revenue) => revenue.Month)));

  // Get unique dates for sales filter
  const dates = Array.from(
    new Set(
      sales.map((sale) => new Date(sale.Date).toISOString().split("T")[0])
    )
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1">
        <section className="w-full py-6 md:py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
              <div className="flex-1 space-y-4">
                <h1 className="inline-block text-4xl font-bold tracking-tight lg:text-5xl">
                  Financials
                </h1>
                <p className="text-xl text-muted-foreground">
                  Manage your financial data
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/financials/revenue/new">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Revenue Record
                  </Button>
                </Link>
                <Link href="/financials/sales/new">
                  <Button variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Sales Record
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-8 space-y-6">
              <Tabs defaultValue="revenue">
                <TabsList>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                </TabsList>
                <TabsContent value="revenue">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Tracking</CardTitle>
                      <CardDescription>
                        Monthly revenue data for all restaurants
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RevenueTable
                        initialRevenues={revenues}
                        restaurants={restaurants}
                        months={months}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="sales">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sales Tracking</CardTitle>
                      <CardDescription>
                        Daily sales transactions for all restaurants
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SalesTable
                        initialSales={sales}
                        restaurants={restaurants}
                        dates={dates}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

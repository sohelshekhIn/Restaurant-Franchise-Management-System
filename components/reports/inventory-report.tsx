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
import { Download, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface InventoryItem {
  IngredientId: number;
  MenuId: number;
  DishId: number;
  IngredientName: string;
  Price: number;
  DishName: string;
  MenuName: string;
}

interface Menu {
  MenuId: number;
  MenuName: string;
}

interface Dish {
  DishId: number;
  DishName: string;
}

interface SummaryStats {
  totalIngredients: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  mostExpensiveCategory: string;
}

export function InventoryReport({
  inventory,
  menus,
  dishes,
}: {
  inventory: InventoryItem[];
  menus: Menu[];
  dishes: Dish[];
}) {
  const [filteredInventory, setFilteredInventory] =
    useState<InventoryItem[]>(inventory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMenu, setSelectedMenu] = useState<string>("all");
  const [selectedDish, setSelectedDish] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalIngredients: 0,
    averagePrice: 0,
    minPrice: 0,
    maxPrice: 0,
    mostExpensiveCategory: "",
  });

  // Calculate summary statistics
  useEffect(() => {
    if (filteredInventory.length > 0) {
      const prices = filteredInventory.map((item) => item.Price || 0);
      const categories = filteredInventory.reduce((acc: any, item) => {
        const category = item.MenuName || "Uncategorized";
        acc[category] = (acc[category] || 0) + (item.Price || 0);
        return acc;
      }, {});

      const mostExpensiveCategory = Object.entries(categories).reduce(
        (max, [category, total]) =>
          (total as number) > (categories[max] || 0) ? category : max,
        Object.keys(categories)[0]
      );

      setSummaryStats({
        totalIngredients: filteredInventory.length,
        averagePrice:
          prices.reduce((sum, price) => sum + price, 0) / prices.length,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        mostExpensiveCategory,
      });
    }
  }, [filteredInventory]);

  // Fetch AI insights
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoadingInsights(true);
        setInsightsError(null);

        const response = await fetch("/api/ai/inventory-insights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inventoryData: filteredInventory,
            menuData: menus,
            dishData: dishes,
            summaryStats,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate insights");
        }

        const data = await response.json();
        setInsights(data.insights);
      } catch (err) {
        setInsightsError(
          err instanceof Error ? err.message : "An error occurred"
        );
      } finally {
        setLoadingInsights(false);
      }
    };

    fetchInsights();
  }, [filteredInventory, menus, dishes, summaryStats]);

  useEffect(() => {
    // Apply filters
    let filtered = [...inventory];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.IngredientName.toLowerCase().includes(
            searchQuery.toLowerCase()
          ) ||
          item.DishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.MenuName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply menu filter
    if (selectedMenu !== "all") {
      filtered = filtered.filter(
        (item) => item.MenuId.toString() === selectedMenu
      );
    }

    // Apply dish filter
    if (selectedDish !== "all") {
      filtered = filtered.filter(
        (item) => item.DishId.toString() === selectedDish
      );
    }

    setFilteredInventory(filtered);
  }, [inventory, searchQuery, selectedMenu, selectedDish]);

  const handleExportCSV = () => {
    // Create CSV content
    const headers = [
      "Ingredient ID",
      "Ingredient Name",
      "Dish",
      "Menu",
      "Price",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredInventory.map(
        (item) =>
          `${item.IngredientId},${item.IngredientName},${item.DishName},${item.MenuName},${item.Price}`
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `inventory_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate chart data
  const categoryDistribution = filteredInventory.reduce((acc: any, item) => {
    const category = item.MenuName || "Uncategorized";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryDistribution).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  // Calculate price distribution
  const priceRanges = {
    "0-10": 0,
    "11-20": 0,
    "21-30": 0,
    "31-40": 0,
    "41+": 0,
  };

  filteredInventory.forEach((item) => {
    const price = item.Price || 0;
    if (price <= 10) priceRanges["0-10"]++;
    else if (price <= 20) priceRanges["11-20"]++;
    else if (price <= 30) priceRanges["21-30"]++;
    else if (price <= 40) priceRanges["31-40"]++;
    else priceRanges["41+"]++;
  });

  const priceData = Object.entries(priceRanges).map(([range, count]) => ({
    range,
    count,
  }));

  if (isLoading) {
    return <div className="text-center py-10">Loading inventory data...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by ingredient, dish, or menu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={selectedMenu} onValueChange={setSelectedMenu}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select menu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Menus</SelectItem>
            {menus.map((menu) => (
              <SelectItem key={menu.MenuId} value={menu.MenuId.toString()}>
                {menu.MenuName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedDish} onValueChange={setSelectedDish}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select dish" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dishes</SelectItem>
            {dishes.map((dish) => (
              <SelectItem key={dish.DishId} value={dish.DishId.toString()}>
                {dish.DishName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryStats.totalIngredients}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summaryStats.averagePrice.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summaryStats.minPrice.toFixed(2)} - $
              {summaryStats.maxPrice.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Most Expensive Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryStats.mostExpensiveCategory}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Items" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Items" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingInsights ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : insightsError ? (
            <p className="text-sm text-destructive">{insightsError}</p>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {insights.map((insight, index) => (
                  <div key={index} className="space-y-2">
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: insight }}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient ID</TableHead>
                  <TableHead>Ingredient Name</TableHead>
                  <TableHead>Dish</TableHead>
                  <TableHead>Menu</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      No inventory data found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
                    <TableRow key={item.IngredientId}>
                      <TableCell>{item.IngredientId}</TableCell>
                      <TableCell>{item.IngredientName}</TableCell>
                      <TableCell>{item.DishName}</TableCell>
                      <TableCell>{item.MenuName}</TableCell>
                      <TableCell className="text-right">
                        ${item.Price.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

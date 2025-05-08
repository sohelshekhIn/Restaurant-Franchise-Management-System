"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import {
  Download,
  BarChart3,
  TrendingUp,
  Calendar,
  Filter,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Sale {
  SalesId: number;
  RestaurantId: number;
  Date: string;
  Amount: number;
  RestaurantName: string;
}

interface Restaurant {
  RestaurantId: number;
  Name: string;
}

export function SalesReport({
  restaurants,
  sales,
}: {
  restaurants: Restaurant[];
  sales: Sale[];
}) {
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("table");
  const [groupBy, setGroupBy] = useState<
    "day" | "week" | "month" | "restaurant"
  >("day");
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Calculate summary statistics
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.Amount, 0);
  const averageSale =
    filteredSales.length > 0 ? totalSales / filteredSales.length : 0;
  const maxSale =
    filteredSales.length > 0
      ? Math.max(...filteredSales.map((sale) => sale.Amount))
      : 0;
  const minSale =
    filteredSales.length > 0
      ? Math.min(...filteredSales.map((sale) => sale.Amount))
      : 0;

  // Calculate growth rate based on timeframe
  const calculateGrowthRate = (
    timeframe: "week" | "month" | "quarter" | "year"
  ) => {
    if (filteredSales.length < 2) return 0;

    // Sort sales by date
    const sortedSales = [...filteredSales].sort(
      (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime()
    );

    // Calculate the number of days to look back based on timeframe
    let daysToLookBack = 0;
    switch (timeframe) {
      case "week":
        daysToLookBack = 7;
        break;
      case "month":
        daysToLookBack = 30;
        break;
      case "quarter":
        daysToLookBack = 90;
        break;
      case "year":
        daysToLookBack = 365;
        break;
    }

    // Get the most recent date
    const mostRecentDate = new Date(sortedSales[sortedSales.length - 1].Date);

    // Calculate the date range for the current period
    const currentPeriodEnd = mostRecentDate;
    const currentPeriodStart = new Date(mostRecentDate);
    currentPeriodStart.setDate(
      currentPeriodStart.getDate() - daysToLookBack / 2
    );

    // Calculate the date range for the previous period
    const previousPeriodEnd = new Date(currentPeriodStart);
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
    const previousPeriodStart = new Date(previousPeriodEnd);
    previousPeriodStart.setDate(
      previousPeriodStart.getDate() - daysToLookBack / 2
    );

    // Filter sales for current and previous periods
    const currentPeriodSales = sortedSales.filter(
      (sale) =>
        new Date(sale.Date) >= currentPeriodStart &&
        new Date(sale.Date) <= currentPeriodEnd
    );

    const previousPeriodSales = sortedSales.filter(
      (sale) =>
        new Date(sale.Date) >= previousPeriodStart &&
        new Date(sale.Date) <= previousPeriodEnd
    );

    // Calculate totals for each period
    const currentPeriodTotal = currentPeriodSales.reduce(
      (sum, sale) => sum + sale.Amount,
      0
    );
    const previousPeriodTotal = previousPeriodSales.reduce(
      (sum, sale) => sum + sale.Amount,
      0
    );

    // Calculate growth rate
    if (previousPeriodTotal === 0) return 0;
    return (
      ((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) * 100
    );
  };

  const growthRate = calculateGrowthRate(selectedTimeframe);

  // Get top performing restaurants
  const restaurantSales = restaurants
    .map((restaurant) => {
      const restaurantSales = filteredSales.filter(
        (sale) => sale.RestaurantId === restaurant.RestaurantId
      );
      const total = restaurantSales.reduce((sum, sale) => sum + sale.Amount, 0);
      return {
        name: restaurant.Name,
        total,
        count: restaurantSales.length,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Prepare data for charts
  const prepareChartData = () => {
    if (groupBy === "restaurant") {
      return restaurants.map((restaurant) => {
        const restaurantSales = filteredSales.filter(
          (sale) => sale.RestaurantId === restaurant.RestaurantId
        );
        const total = restaurantSales.reduce(
          (sum, sale) => sum + sale.Amount,
          0
        );
        return {
          name: restaurant.Name,
          sales: total,
        };
      });
    } else {
      // Group by date (day, week, month)
      const groupedData: Record<string, number> = {};

      filteredSales.forEach((sale) => {
        const date = new Date(sale.Date);
        let key = "";

        if (groupBy === "day") {
          key = date.toISOString().split("T")[0];
        } else if (groupBy === "week") {
          // Get the Monday of the week
          const day = date.getDay();
          const diff = date.getDate() - day + (day === 0 ? -6 : 1);
          const monday = new Date(date.setDate(diff));
          key = monday.toISOString().split("T")[0];
        } else if (groupBy === "month") {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
        }

        groupedData[key] = (groupedData[key] || 0) + sale.Amount;
      });

      return Object.entries(groupedData)
        .map(([name, sales]) => ({
          name,
          sales,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }
  };

  const chartData = prepareChartData();

  // Generate AI insights
  const generateInsights = async () => {
    try {
      setIsLoadingInsights(true);
      setInsightError(null);

      // Calculate summary statistics
      const totalSales = filteredSales.reduce(
        (sum, sale) => sum + sale.Amount,
        0
      );
      const averageSale = totalSales / filteredSales.length;
      const minSale = Math.min(...filteredSales.map((s) => s.Amount));
      const maxSale = Math.max(...filteredSales.map((s) => s.Amount));

      // Calculate growth rate (comparing to previous period)
      const midPoint = Math.floor(filteredSales.length / 2);
      const recentSales = filteredSales.slice(midPoint);
      const previousSales = filteredSales.slice(0, midPoint);
      const recentTotal = recentSales.reduce(
        (sum, sale) => sum + sale.Amount,
        0
      );
      const previousTotal = previousSales.reduce(
        (sum, sale) => sum + sale.Amount,
        0
      );
      const growthRate =
        previousTotal === 0
          ? 100
          : ((recentTotal - previousTotal) / previousTotal) * 100;

      // Get restaurant performance data
      const restaurantPerformance = filteredSales.reduce((acc: any, sale) => {
        if (!acc[sale.RestaurantName]) {
          acc[sale.RestaurantName] = { total: 0, count: 0 };
        }
        acc[sale.RestaurantName].total += sale.Amount;
        acc[sale.RestaurantName].count += 1;
        return acc;
      }, {});

      const restaurantData = Object.entries(restaurantPerformance)
        .map(([name, data]: [string, any]) => ({
          name,
          ...data,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Call our API route with the data
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          salesData: filteredSales,
          restaurantData,
          summaryStats: {
            totalSales,
            averageSale,
            minSale,
            maxSale,
            growthRate,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate insights");
      }

      const data = await response.json();
      setAiInsights(data.insights);
    } catch (error) {
      console.error("Error generating insights:", error);
      setInsightError("Failed to generate insights. Please try again later.");
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Prepare comparison data
  const prepareComparisonData = () => {
    if (!showComparison) return [];

    const currentData = prepareChartData();

    // For demonstration, we'll create some synthetic comparison data
    // In a real implementation, this would fetch historical data
    return currentData.map((item) => ({
      name: item.name,
      current: item.sales,
      previous: item.sales * (1 - (Math.random() * 0.2 + 0.1)), // Random decrease between 10-30%
    }));
  };

  useEffect(() => {
    setComparisonData(prepareComparisonData());
  }, [showComparison, filteredSales, groupBy]);

  useEffect(() => {
    // Apply filters
    let filtered = [...sales];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((sale) =>
        sale.RestaurantName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply restaurant filter
    if (selectedRestaurant !== "all") {
      filtered = filtered.filter(
        (sale) => sale.RestaurantId.toString() === selectedRestaurant
      );
    }

    // Apply date range filter
    if (startDate) {
      filtered = filtered.filter((sale) => {
        // Convert both dates to YYYY-MM-DD format for comparison
        const saleDate = new Date(sale.Date).toISOString().split("T")[0];
        return saleDate >= startDate;
      });
    }
    if (endDate) {
      filtered = filtered.filter((sale) => {
        // Convert both dates to YYYY-MM-DD format for comparison
        const saleDate = new Date(sale.Date).toISOString().split("T")[0];
        return saleDate <= endDate;
      });
    }

    setFilteredSales(filtered);
  }, [sales, searchQuery, selectedRestaurant, startDate, endDate]);

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["Sales ID", "Restaurant", "Date", "Amount"];
    const csvContent = [
      headers.join(","),
      ...filteredSales.map(
        (sale) =>
          `${sale.SalesId},${sale.RestaurantName},${sale.Date},${sale.Amount}`
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `sales_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract recommendations from insights
  const extractRecommendations = (insights: string[]) => {
    const recommendations: { title: string; content: string }[] = [];

    insights.forEach((insight) => {
      // Look for "Actionable Recommendation:" sections
      const lines = insight.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.includes("Actionable Recommendation:")) {
          // Extract the recommendation content
          let content = line.replace("Actionable Recommendation:", "").trim();

          // If the content is empty, try to get the next line
          if (!content && i + 1 < lines.length) {
            content = lines[i + 1].trim();
          }

          // Create a title based on the recommendation content
          let title = "Recommendation";

          // Try to extract a more specific title from the content
          if (content.includes(":")) {
            const parts = content.split(":");
            title = parts[0].trim();
            content = parts.slice(1).join(":").trim();
          } else if (content.length > 0) {
            // Use the first few words as a title
            const words = content.split(" ");
            title = words.slice(0, 3).join(" ");
          }

          recommendations.push({ title, content });
        }
      }
    });

    return recommendations;
  };

  // Calculate forecast based on timeframe
  const calculateForecast = (
    timeframe: "week" | "month" | "quarter" | "year"
  ) => {
    // Get the average daily sales
    const totalDays =
      filteredSales.length > 0
        ? Math.ceil(
            Number(
              (new Date(
                Math.max(
                  ...filteredSales.map((s) => new Date(s.Date).getTime())
                )
              ).getTime() -
                new Date(
                  Math.min(
                    ...filteredSales.map((s) => new Date(s.Date).getTime())
                  )
                ).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          ) + 1
        : 1;

    const averageDailySales = totalSales / totalDays;

    // Calculate number of days in the forecast period
    let forecastDays = 0;
    switch (timeframe) {
      case "week":
        forecastDays = 7;
        break;
      case "month":
        forecastDays = 30;
        break;
      case "quarter":
        forecastDays = 90;
        break;
      case "year":
        forecastDays = 365;
        break;
    }

    // Calculate base forecast
    let baseForecast = averageDailySales * forecastDays;

    // Apply growth rate
    const forecastWithGrowth = baseForecast * (1 + growthRate / 100);

    // Apply seasonality adjustment if we have enough data
    if (filteredSales.length > 30) {
      // Group sales by month to detect seasonal patterns
      const monthlySales = filteredSales.reduce(
        (acc: { [key: string]: number }, sale) => {
          const monthKey = new Date(sale.Date).toISOString().slice(0, 7); // YYYY-MM format
          acc[monthKey] = (acc[monthKey] || 0) + sale.Amount;
          return acc;
        },
        {}
      );

      // Calculate average monthly variation
      const monthlyValues = Object.values(monthlySales);
      const avgMonthly =
        monthlyValues.reduce((sum, val) => sum + val, 0) / monthlyValues.length;
      const variation =
        monthlyValues.reduce(
          (sum, val) => sum + Math.abs(val - avgMonthly),
          0
        ) / monthlyValues.length;

      // Apply seasonal adjustment factor
      const seasonalFactor = 1 + variation / avgMonthly;
      return forecastWithGrowth * seasonalFactor;
    }

    return forecastWithGrowth;
  };

  return (
    <div className="space-y-6">
      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalSales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredSales.length} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {averageSale.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                growthRate >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {growthRate >= 0 ? "+" : ""}
              {growthRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Compared to previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Range</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${minSale.toLocaleString()} - ${maxSale.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Min - Max transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Restaurants */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Restaurants</CardTitle>
          <CardDescription>
            Restaurants with highest sales volume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {restaurantSales.map((restaurant, index) => (
              <div key={index} className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{restaurant.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {restaurant.count} transactions
                  </div>
                </div>
                <div className="text-sm font-medium">
                  ${restaurant.total.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Data</CardTitle>
          <CardDescription>Filter and analyze your sales data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search by restaurant name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            <div className="flex flex-row gap-1 items-center mx-3">
              <Label htmlFor="startDate">Start</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <div className="flex flex-row gap-1 items-center">
              <Label htmlFor="endDate">End</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <Button onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Tabs for different views */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            {/* Table View */}
            <TabsContent value="table">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sales ID</TableHead>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6">
                          No sales data found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSales.map((sale, index) => (
                        <TableRow key={index}>
                          <TableCell>{sale.SalesId}</TableCell>
                          <TableCell>{sale.RestaurantName}</TableCell>
                          <TableCell>
                            {new Date(sale.Date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            ${sale.Amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Chart View */}
            <TabsContent value="chart">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="groupBy">Group by:</Label>
                    <Select
                      value={groupBy}
                      onValueChange={(
                        value: "day" | "week" | "month" | "restaurant"
                      ) => setGroupBy(value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Group by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">By Day</SelectItem>
                        <SelectItem value="week">By Week</SelectItem>
                        <SelectItem value="month">By Month</SelectItem>
                        <SelectItem value="restaurant">
                          By Restaurant
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="comparison">Show comparison:</Label>
                    <Select
                      value={showComparison ? "yes" : "no"}
                      onValueChange={(value) =>
                        setShowComparison(value === "yes")
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Comparison" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={showComparison ? comparisonData : chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {showComparison ? (
                        <>
                          <Bar
                            dataKey="current"
                            name="Current Period"
                            fill="#8884d8"
                          />
                          <Bar
                            dataKey="previous"
                            name="Previous Period"
                            fill="#82ca9d"
                          />
                        </>
                      ) : (
                        <Bar
                          dataKey="sales"
                          name="Sales Amount"
                          fill="#8884d8"
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={showComparison ? comparisonData : chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {showComparison ? (
                        <>
                          <Line
                            type="monotone"
                            dataKey="current"
                            name="Current Period"
                            stroke="#8884d8"
                          />
                          <Line
                            type="monotone"
                            dataKey="previous"
                            name="Previous Period"
                            stroke="#82ca9d"
                          />
                        </>
                      ) : (
                        <Line
                          type="monotone"
                          dataKey="sales"
                          name="Sales Trend"
                          stroke="#82ca9d"
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {groupBy === "restaurant" && (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="sales"
                          nameKey="name"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`hsl(${index * 45}, 70%, 50%)`}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Analysis View */}
            <TabsContent value="analysis">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Distribution</CardTitle>
                    <CardDescription>
                      How sales are distributed across restaurants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={restaurants.map((restaurant) => {
                            const restaurantSales = filteredSales.filter(
                              (sale) =>
                                sale.RestaurantId === restaurant.RestaurantId
                            );
                            const total = restaurantSales.reduce(
                              (sum, sale) => sum + sale.Amount,
                              0
                            );
                            return {
                              name: restaurant.Name,
                              sales: total,
                            };
                          })}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="sales"
                            name="Sales Amount"
                            fill="#8884d8"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sales Insights</CardTitle>
                    <CardDescription>Intelligent analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isLoadingInsights ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                          <p className="text-sm text-muted-foreground">
                            Generating intelligent insights...
                          </p>
                        </div>
                      ) : insightError ? (
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{insightError}</AlertDescription>
                        </Alert>
                      ) : aiInsights.length > 0 ? (
                        <ScrollArea className="h-[300px] pr-4">
                          <div className="space-y-4">
                            {aiInsights.map((insight, index) => (
                              <div
                                key={index}
                                className="p-3 bg-muted rounded-lg"
                              >
                                <div className="flex items-start">
                                  <Sparkles className="h-5 w-5 text-primary mr-2 mt-0.5" />
                                  <div className="text-sm">
                                    {insight.split("**").map((part, i) =>
                                      i % 2 === 0 ? (
                                        <span key={i}>{part}</span>
                                      ) : (
                                        <strong key={i} className="font-bold">
                                          {part}
                                        </strong>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8">
                          <Sparkles className="h-8 w-8 text-primary mb-4" />
                          <p className="text-sm text-muted-foreground mb-4">
                            Generate AI-powered insights based on your sales
                            data
                          </p>
                          <Button onClick={generateInsights}>
                            Generate Insights
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Forecast</CardTitle>
                    <CardDescription>
                      Predicted sales based on historical data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Forecast Period</h4>
                        <Select
                          value={selectedTimeframe}
                          onValueChange={(
                            value: "week" | "month" | "quarter" | "year"
                          ) => setSelectedTimeframe(value)}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select timeframe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="week">Next Week</SelectItem>
                            <SelectItem value="month">Next Month</SelectItem>
                            <SelectItem value="quarter">
                              Next Quarter
                            </SelectItem>
                            <SelectItem value="year">Next Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="h-[250px] flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-2">
                            $
                            {calculateForecast(
                              selectedTimeframe
                            ).toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Predicted {selectedTimeframe}ly sales based on
                            historical data
                            {filteredSales.length > 30 &&
                              " (includes seasonal adjustments)"}
                          </p>
                          <div className="mt-4 flex items-center justify-center">
                            <Badge
                              variant={
                                calculateGrowthRate(selectedTimeframe) >= 0
                                  ? "default"
                                  : "destructive"
                              }
                              className="mr-2"
                            >
                              {calculateGrowthRate(selectedTimeframe) >= 0
                                ? "+"
                                : ""}
                              {calculateGrowthRate(selectedTimeframe).toFixed(
                                1
                              )}
                              %
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {selectedTimeframe}ly growth trend
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>
                      Actionable insights to improve your business
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {aiInsights.length > 0 ? (
                          extractRecommendations(aiInsights).map(
                            (rec, index) => (
                              <div
                                key={index}
                                className="p-3 bg-muted rounded-lg"
                              >
                                <h4 className="text-sm font-medium mb-2">
                                  {rec.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {rec.content.split("**").map((part, i) =>
                                    i % 2 === 0 ? (
                                      <span key={i}>{part}</span>
                                    ) : (
                                      <strong key={i} className="font-bold">
                                        {part}
                                      </strong>
                                    )
                                  )}
                                </p>
                              </div>
                            )
                          )
                        ) : (
                          <>
                            <div className="p-3 bg-muted rounded-lg">
                              <h4 className="text-sm font-medium mb-2">
                                Inventory Management
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Based on your sales patterns, consider adjusting
                                inventory levels by{" "}
                                {growthRate > 0 ? "increasing" : "decreasing"}{" "}
                                stock by approximately{" "}
                                {Math.abs(growthRate).toFixed(0)}% to match
                                projected demand.
                              </p>
                            </div>

                            <Separator />

                            <div className="p-3 bg-muted rounded-lg">
                              <h4 className="text-sm font-medium mb-2">
                                Staffing Optimization
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {growthRate > 5
                                  ? "Consider hiring additional staff to handle increased demand."
                                  : growthRate < -5
                                  ? "Evaluate staffing levels to reduce costs during slower periods."
                                  : "Maintain current staffing levels with flexibility for peak times."}
                              </p>
                            </div>

                            <Separator />

                            <div className="p-3 bg-muted rounded-lg">
                              <h4 className="text-sm font-medium mb-2">
                                Marketing Strategy
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {growthRate < 0
                                  ? "Implement targeted promotions to boost sales during slower periods."
                                  : "Focus marketing efforts on your top-performing restaurants to maximize ROI."}
                              </p>
                            </div>

                            <Separator />

                            <div className="p-3 bg-muted rounded-lg">
                              <h4 className="text-sm font-medium mb-2">
                                Menu Optimization
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Analyze sales data to identify your most
                                profitable menu items and consider featuring
                                them more prominently or creating combo meals to
                                increase average transaction value.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

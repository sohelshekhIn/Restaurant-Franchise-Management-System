"use client";

import { useEffect, useState } from "react";
import { Revenue, Restaurant, TimeFrame } from "./types";
import { RevenueFilters } from "./revenue-filters";
import { RevenueTable } from "./revenue-table";
import { RevenueCharts } from "./revenue-charts";
import { SummaryStats } from "./summary-stats";
import { RevenueForecast } from "./revenue-forecast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RevenueReportProps {
  revenues: Revenue[];
  restaurants: Restaurant[];
}

export function RevenueReport({ revenues, restaurants }: RevenueReportProps) {
  const [filteredRevenues, setFilteredRevenues] = useState<Revenue[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("month");
  const [showTrends, setShowTrends] = useState(false);
  const [showSeasonality, setShowSeasonality] = useState(false);

  // Filter revenues based on search query and selected filters
  useEffect(() => {
    let filtered = [...revenues];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((revenue) =>
        revenue.RestaurantName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by restaurant
    if (selectedRestaurant !== "all") {
      filtered = filtered.filter(
        (revenue) => revenue.RestaurantId.toString() === selectedRestaurant
      );
    }

    // Filter by month
    if (selectedMonth !== "all") {
      filtered = filtered.filter((revenue) => revenue.Month === selectedMonth);
    }

    setFilteredRevenues(filtered);
  }, [revenues, searchQuery, selectedRestaurant, selectedMonth]);

  // Calculate summary statistics
  const totalSales = filteredRevenues.reduce(
    (sum, revenue) => sum + revenue.MonthlySale,
    0
  );
  const totalMaintenance = filteredRevenues.reduce(
    (sum, revenue) => sum + revenue.MonthlyMaintenance,
    0
  );
  const totalSalaries = filteredRevenues.reduce(
    (sum, revenue) => sum + revenue.EmployeeSalaries,
    0
  );
  const totalProfit = filteredRevenues.reduce(
    (sum, revenue) => sum + revenue.Profit,
    0
  );
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

  // Calculate growth rate (comparing with previous period)
  const currentPeriod = filteredRevenues.reduce(
    (sum, revenue) => sum + revenue.MonthlySale,
    0
  );
  const previousPeriod = revenues
    .filter((revenue) => !filteredRevenues.includes(revenue))
    .reduce((sum, revenue) => sum + revenue.MonthlySale, 0);
  const growthRate =
    previousPeriod > 0
      ? ((currentPeriod - previousPeriod) / previousPeriod) * 100
      : 0;

  // Calculate seasonality
  const calculateSeasonality = () => {
    const monthlyAverages: Record<string, number> = {};
    const monthCounts: Record<string, number> = {};

    revenues.forEach((revenue) => {
      const month = revenue.Month;
      monthlyAverages[month] =
        (monthlyAverages[month] || 0) + revenue.MonthlySale;
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });

    Object.keys(monthlyAverages).forEach((month) => {
      monthlyAverages[month] = monthlyAverages[month] / monthCounts[month];
    });

    return monthlyAverages;
  };

  const seasonalityData = calculateSeasonality();

  // Calculate trends
  const calculateTrends = () => {
    const sortedRevenues = [...revenues].sort(
      (a, b) => new Date(a.Month).getTime() - new Date(b.Month).getTime()
    );

    const salesByMonth = sortedRevenues.map((r) => r.MonthlySale);
    const months = sortedRevenues.map((r) => r.Month);

    // Simple linear regression
    const n = salesByMonth.length;
    if (n < 2) return { slope: 0, intercept: 0, months, salesByMonth };

    const sumX = months.reduce((sum, _, i) => sum + i, 0);
    const sumY = salesByMonth.reduce((sum, val) => sum + val, 0);
    const sumXY = months.reduce((sum, _, i) => sum + i * salesByMonth[i], 0);
    const sumXX = months.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept, months, salesByMonth };
  };

  const trendData = calculateTrends();

  // Handle CSV export
  const handleExportCSV = () => {
    const headers = [
      "Revenue ID",
      "Restaurant",
      "Month",
      "Monthly Sale",
      "Maintenance",
      "Salaries",
      "Profit",
    ];
    const csvData = filteredRevenues.map((revenue) => [
      revenue.idRevenue,
      revenue.RestaurantName,
      revenue.Month,
      revenue.MonthlySale,
      revenue.MonthlyMaintenance,
      revenue.EmployeeSalaries,
      revenue.Profit,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...csvData].map((row) => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `revenue_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <RevenueFilters
        restaurants={restaurants}
        searchQuery={searchQuery}
        selectedRestaurant={selectedRestaurant}
        selectedMonth={selectedMonth}
        onSearchChange={setSearchQuery}
        onRestaurantChange={setSelectedRestaurant}
        onMonthChange={setSelectedMonth}
        onExportCSV={handleExportCSV}
      />

      <SummaryStats
        filteredRevenues={filteredRevenues}
        totalSales={totalSales}
        totalMaintenance={totalMaintenance}
        totalSalaries={totalSalaries}
        totalProfit={totalProfit}
        profitMargin={profitMargin}
        growthRate={growthRate}
      />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Advanced Analytics</h2>
        <div className="flex gap-4">
          <Select
            value={timeFrame}
            onValueChange={(value) => setTimeFrame(value as TimeFrame)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="quarter">Quarterly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="forecast">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="seasonality">Seasonality</TabsTrigger>
        </TabsList>
        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueForecast
                filteredRevenues={filteredRevenues}
                growthRate={growthRate}
                timeFrame={timeFrame}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <RevenueCharts
                  revenues={filteredRevenues}
                  restaurants={restaurants}
                  showTrends={true}
                  showSeasonality={false}
                  trendData={trendData}
                />
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium">Trend Analysis</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {trendData.slope > 0
                    ? `Revenue is trending upward with an average increase of $${trendData.slope.toFixed(
                        2
                      )} per month.`
                    : `Revenue is trending downward with an average decrease of $${Math.abs(
                        trendData.slope
                      ).toFixed(2)} per month.`}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="seasonality">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <RevenueCharts
                  revenues={filteredRevenues}
                  restaurants={restaurants}
                  showTrends={false}
                  showSeasonality={true}
                  seasonalityData={seasonalityData}
                />
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium">Seasonality Analysis</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {Object.entries(seasonalityData)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([month, avg]) => `${month}: $${avg.toFixed(2)}`)
                    .join(", ")}{" "}
                  are the highest revenue months.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Details</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueTable revenues={filteredRevenues} />
        </CardContent>
      </Card>
    </div>
  );
}

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
import { Download, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueForecast } from "./revenue/revenue-forecast";
import { RevenueCharts } from "./revenue/revenue-charts";
import { RevenueTable } from "./revenue/revenue-table";
import {
  Revenue,
  Restaurant,
  TimeFrame,
  TrendData,
  SeasonalityData,
} from "./revenue/types";
import { Label } from "@/components/ui/label";

interface RevenueReportProps {
  revenues: Revenue[];
  restaurants: Restaurant[];
}

export function RevenueReport({ revenues, restaurants }: RevenueReportProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("month");
  const [growthRate, setGrowthRate] = useState(0.05);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filteredRevenues, setFilteredRevenues] = useState<Revenue[]>(revenues);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [seasonalityData, setSeasonalityData] =
    useState<SeasonalityData | null>(null);

  useEffect(() => {
    let filtered = [...revenues];

    // Apply restaurant name search filter
    if (searchTerm) {
      filtered = filtered.filter((revenue) =>
        revenue.RestaurantName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply restaurant filter
    if (selectedRestaurant) {
      filtered = filtered.filter(
        (revenue) => revenue.RestaurantId.toString() === selectedRestaurant
      );
    }

    // Apply date range filter
    if (startDate && endDate) {
      filtered = filtered.filter(
        (revenue) => revenue.Month >= startDate && revenue.Month <= endDate
      );
    }

    setFilteredRevenues(filtered);
  }, [revenues, searchTerm, selectedRestaurant, startDate, endDate]);

  // Calculate trend data
  useEffect(() => {
    if (filteredRevenues.length > 0) {
      const months = filteredRevenues.map((r) => r.Month);
      const salesByMonth = filteredRevenues.map((r) => r.MonthlySale);

      // Calculate linear regression
      const n = months.length;
      const sumX = months.reduce((sum, _, i) => sum + i, 0);
      const sumY = salesByMonth.reduce((sum, val) => sum + val, 0);
      const sumXY = months.reduce((sum, _, i) => sum + i * salesByMonth[i], 0);
      const sumXX = months.reduce((sum, _, i) => sum + i * i, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      setTrendData({
        months,
        salesByMonth,
        slope,
        intercept,
      });
    }
  }, [filteredRevenues]);

  // Calculate seasonality data
  useEffect(() => {
    if (filteredRevenues.length > 0) {
      const seasonality: SeasonalityData = {};
      const monthlyAverages: { [key: string]: number[] } = {};

      // Group sales by month
      filteredRevenues.forEach((revenue) => {
        const month = revenue.Month.split("-")[1]; // Extract month from YYYY-MM
        if (!monthlyAverages[month]) {
          monthlyAverages[month] = [];
        }
        monthlyAverages[month].push(revenue.MonthlySale);
      });

      // Calculate average for each month
      Object.entries(monthlyAverages).forEach(([month, sales]) => {
        const average = sales.reduce((sum, val) => sum + val, 0) / sales.length;
        seasonality[month] = average;
      });

      setSeasonalityData(seasonality);
    }
  }, [filteredRevenues]);

  const handleExportCSV = () => {
    // Create CSV content
    const headers = [
      "Revenue ID",
      "Restaurant",
      "Month",
      "Monthly Sale",
      "Maintenance",
      "Salaries",
      "Profit",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredRevenues.map(
        (revenue) =>
          `${revenue.idRevenue},${revenue.RestaurantName},${revenue.Month},${revenue.MonthlySale},${revenue.MonthlyMaintenance},${revenue.EmployeeSalaries},${revenue.Profit}`
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `revenue_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Report</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <Label htmlFor="search">Search Restaurant</Label>
            <Input
              id="search"
              placeholder="Search by restaurant name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="restaurant">Filter by Restaurant</Label>
            <Select
              value={selectedRestaurant}
              onValueChange={setSelectedRestaurant}
            >
              <SelectTrigger id="restaurant">
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
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="month"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="month"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mt-5"
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="forecast" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Forecast
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger
              value="seasonality"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Seasonality
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <RevenueTable revenues={filteredRevenues} />
            <RevenueCharts
              revenues={filteredRevenues}
              restaurants={restaurants}
              showTrends={false}
              showSeasonality={false}
            />
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <label htmlFor="timeFrame" className="text-sm font-medium">
                  Time Frame:
                </label>
                <Select
                  value={timeFrame}
                  onValueChange={(value: TimeFrame) => setTimeFrame(value)}
                >
                  <SelectTrigger id="timeFrame" className="w-[180px]">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="quarter">Quarterly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="growthRate" className="text-sm font-medium">
                  Growth Rate (%):
                </label>
                <Input
                  id="growthRate"
                  type="number"
                  value={growthRate * 100}
                  onChange={(e) =>
                    setGrowthRate(parseFloat(e.target.value) / 100)
                  }
                  className="w-[100px]"
                />
              </div>
            </div>
            <RevenueForecast
              filteredRevenues={filteredRevenues}
              growthRate={growthRate}
              timeFrame={timeFrame}
            />
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <RevenueCharts
              revenues={filteredRevenues}
              restaurants={restaurants}
              showTrends={true}
              showSeasonality={false}
              trendData={trendData}
            />
            {trendData && (
              <Card>
                <CardHeader>
                  <CardTitle>Trend Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Trend Direction: </span>
                      {trendData.slope > 0 ? "Upward" : "Downward"}
                    </p>
                    <p>
                      <span className="font-medium">
                        Average Monthly Change:{" "}
                      </span>
                      ${Math.abs(trendData.slope).toFixed(2)}
                    </p>
                    <p>
                      <span className="font-medium">Trend Strength: </span>
                      {Math.abs(trendData.slope) > 1000
                        ? "Strong"
                        : Math.abs(trendData.slope) > 500
                        ? "Moderate"
                        : "Weak"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="seasonality" className="space-y-4">
            <RevenueCharts
              revenues={filteredRevenues}
              restaurants={restaurants}
              showTrends={false}
              showSeasonality={true}
              seasonalityData={seasonalityData}
            />
            {seasonalityData && (
              <Card>
                <CardHeader>
                  <CardTitle>Seasonality Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">
                        Highest Revenue Month:{" "}
                      </span>
                      {Object.entries(seasonalityData).sort(
                        (a, b) => b[1] - a[1]
                      )[0]?.[0] || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">
                        Lowest Revenue Month:{" "}
                      </span>
                      {Object.entries(seasonalityData).sort(
                        (a, b) => a[1] - b[1]
                      )[0]?.[0] || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Seasonal Variation: </span>
                      {Object.keys(seasonalityData).length > 1
                        ? `${(
                            (Math.max(...Object.values(seasonalityData)) /
                              Math.min(...Object.values(seasonalityData)) -
                              1) *
                            100
                          ).toFixed(1)}%`
                        : "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

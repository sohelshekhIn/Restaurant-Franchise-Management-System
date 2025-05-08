"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Revenue, GroupBy, ChartData, RevenueChartsProps } from "./types";
import { useState, useEffect } from "react";
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

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#a4de6c",
  "#d0ed57",
  "#8dd1e1",
  "#83a6ed",
  "#ff8042",
  "#ffbb28",
];

export function RevenueCharts({
  revenues,
  restaurants,
  showTrends,
  showSeasonality,
  trendData,
  seasonalityData,
}: RevenueChartsProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>("month");
  const [showComparison, setShowComparison] = useState(false);
  const [chartDataState, setChartDataState] = useState<ChartData[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  const prepareChartData = () => {
    if (showTrends && trendData) {
      return trendData.months.map((month, index) => ({
        name: month,
        actual: trendData.salesByMonth[index],
        trend: trendData.slope * index + trendData.intercept,
      }));
    }

    if (showSeasonality && seasonalityData) {
      return Object.entries(seasonalityData).map(([month, avg]) => ({
        name: month,
        average: avg,
      }));
    }

    return restaurants.map((restaurant) => {
      const restaurantRevenues = revenues.filter(
        (r) => r.RestaurantId === restaurant.RestaurantId
      );
      const totalSales = restaurantRevenues.reduce(
        (sum, r) => sum + r.MonthlySale,
        0
      );
      const totalMaintenance = restaurantRevenues.reduce(
        (sum, r) => sum + r.MonthlyMaintenance,
        0
      );
      const totalSalaries = restaurantRevenues.reduce(
        (sum, r) => sum + r.EmployeeSalaries,
        0
      );
      const totalProfit = restaurantRevenues.reduce(
        (sum, r) => sum + r.Profit,
        0
      );

      return {
        name: restaurant.Name,
        sales: totalSales,
        maintenance: totalMaintenance,
        salaries: totalSalaries,
        profit: totalProfit,
      };
    });
  };

  const chartData = prepareChartData();

  if (showTrends) {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual Revenue"
            stroke="#4CAF50"
          />
          <Line
            type="monotone"
            dataKey="trend"
            name="Trend Line"
            stroke="#2196F3"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (showSeasonality) {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="average" name="Average Revenue" fill="#9C27B0" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Label htmlFor="groupBy">Group by:</Label>
          <Select
            value={groupBy}
            onValueChange={(value: GroupBy) => setGroupBy(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">By Month</SelectItem>
              <SelectItem value="restaurant">By Restaurant</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="comparison">Show comparison:</Label>
          <Select
            value={showComparison ? "yes" : "no"}
            onValueChange={(value) => setShowComparison(value === "yes")}
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

      {/* Sales and Profit Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales and Profit Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
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
                <Bar dataKey="sales" name="Sales" fill="#8884d8" />
                <Bar dataKey="profit" name="Profit" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
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
                <Bar dataKey="maintenance" name="Maintenance" fill="#ffc658" />
                <Bar dataKey="salaries" name="Salaries" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Profit Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Profit Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              {showComparison ? (
                <LineChart
                  data={comparisonData}
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
                  <Line
                    type="monotone"
                    dataKey="currentProfit"
                    name="Current Profit"
                    stroke="#8884d8"
                  />
                  <Line
                    type="monotone"
                    dataKey="previousProfit"
                    name="Previous Profit"
                    stroke="#82ca9d"
                  />
                </LineChart>
              ) : (
                <LineChart
                  data={chartData}
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
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="Profit"
                    stroke="#82ca9d"
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Restaurant Distribution Pie Chart */}
      {groupBy === "restaurant" && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution by Restaurant</CardTitle>
          </CardHeader>
          <CardContent>
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
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

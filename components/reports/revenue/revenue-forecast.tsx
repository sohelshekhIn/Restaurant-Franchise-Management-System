"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Revenue, TimeFrame } from "./types";
import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface RevenueForecastProps {
  filteredRevenues: Revenue[];
  growthRate: number;
  timeFrame: TimeFrame;
}

export function RevenueForecast({
  filteredRevenues,
  growthRate,
  timeFrame,
}: RevenueForecastProps) {
  const [timeframe, setTimeframe] = useState<TimeFrame>("month");
  const [forecast, setForecast] = useState<{
    sales: number;
    maintenance: number;
    salaries: number;
    profit: number;
  }>({
    sales: 0,
    maintenance: 0,
    salaries: 0,
    profit: 0,
  });
  const [seasonalAdjustment, setSeasonalAdjustment] = useState<boolean>(false);

  const calculateForecast = () => {
    const lastRevenue = filteredRevenues[filteredRevenues.length - 1];
    if (!lastRevenue) return [];

    const baseAmount = lastRevenue.MonthlySale;
    const periods =
      timeFrame === "month" ? 12 : timeFrame === "quarter" ? 4 : 1;
    const growthFactor = 1 + growthRate / 100;

    return Array.from({ length: periods }, (_, i) => {
      const forecastAmount = baseAmount * Math.pow(growthFactor, i + 1);
      const period = i + 1;
      let label = "";

      switch (timeFrame) {
        case "month":
          label = `Month ${period}`;
          break;
        case "quarter":
          label = `Q${period}`;
          break;
        case "year":
          label = `Year ${period}`;
          break;
      }

      return {
        name: label,
        forecast: Math.round(forecastAmount),
      };
    });
  };

  const forecastData = calculateForecast();

  useEffect(() => {
    const newForecast = calculateForecast();
    setForecast({
      sales: newForecast[newForecast.length - 1].forecast,
      maintenance: 0,
      salaries: 0,
      profit: newForecast[newForecast.length - 1].forecast,
    });
  }, [filteredRevenues, growthRate, timeFrame]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Revenue Forecast</CardTitle>
        <Select
          value={timeFrame}
          onValueChange={(value: TimeFrame) => setTimeframe(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Next Month</SelectItem>
            <SelectItem value="quarter">Next Quarter</SelectItem>
            <SelectItem value="year">Next Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="forecast"
                  name="Forecasted Revenue"
                  fill="#4CAF50"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium">Forecast Summary</h3>
            <p className="text-sm text-gray-600 mt-1">
              Based on a {growthRate > 0 ? "growth" : "decline"} rate of{" "}
              {Math.abs(growthRate).toFixed(1)}%, revenue is projected to{" "}
              {growthRate > 0 ? "increase" : "decrease"} to $
              {forecastData[forecastData.length - 1]?.forecast.toLocaleString()}{" "}
              by the end of the {timeFrame}.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sale, TimeFrame } from "./types";
import { useState, useEffect } from "react";

interface SalesForecastProps {
  filteredSales: Sale[];
  growthRate: number;
}

export function SalesForecast({
  filteredSales,
  growthRate,
}: SalesForecastProps) {
  const [timeframe, setTimeframe] = useState<TimeFrame>("month");
  const [forecast, setForecast] = useState<number>(0);
  const [seasonalAdjustment, setSeasonalAdjustment] = useState<boolean>(false);

  const calculateForecast = (timeframe: TimeFrame) => {
    if (filteredSales.length === 0) return 0;

    // Calculate average daily sales
    const dates = filteredSales.map((s) => new Date(s.Date).getTime());
    const totalDays =
      filteredSales.length > 1
        ? (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24)
        : 1;

    const averageDailySales =
      filteredSales.reduce((sum, sale) => sum + sale.Amount, 0) / totalDays;

    // Calculate forecast period days
    const forecastDays =
      timeframe === "week"
        ? 7
        : timeframe === "month"
        ? 30
        : timeframe === "quarter"
        ? 90
        : 365;

    // Calculate base forecast
    const baseForecast = averageDailySales * forecastDays;

    // Apply growth rate
    const growthAdjustedForecast = baseForecast * (1 + growthRate / 100);

    // Apply seasonal adjustment if we have enough data
    let finalForecast = growthAdjustedForecast;
    if (filteredSales.length > 30) {
      const monthlySales = new Array(12).fill(0);
      const monthlyCounts = new Array(12).fill(0);

      filteredSales.forEach((sale) => {
        const month = new Date(sale.Date).getMonth();
        monthlySales[month] += sale.Amount;
        monthlyCounts[month]++;
      });

      const monthlyAverages = monthlySales.map((total, i) =>
        monthlyCounts[i] > 0 ? total / monthlyCounts[i] : 0
      );

      const maxMonthlyAvg = Math.max(...monthlyAverages);
      const minMonthlyAvg = Math.min(
        ...monthlyAverages.filter((avg) => avg > 0)
      );
      const seasonalFactor = maxMonthlyAvg / minMonthlyAvg;

      finalForecast = growthAdjustedForecast * seasonalFactor;
      setSeasonalAdjustment(true);
    } else {
      setSeasonalAdjustment(false);
    }

    return finalForecast;
  };

  useEffect(() => {
    const newForecast = calculateForecast(timeframe);
    setForecast(newForecast);
  }, [timeframe, filteredSales, growthRate]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sales Forecast</CardTitle>
        <Select
          value={timeframe}
          onValueChange={(value: TimeFrame) => setTimeframe(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Next Week</SelectItem>
            <SelectItem value="month">Next Month</SelectItem>
            <SelectItem value="quarter">Next Quarter</SelectItem>
            <SelectItem value="year">Next Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          ${forecast.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
        <p className="text-xs text-muted-foreground">
          Predicted sales for the next {timeframe}
          {seasonalAdjustment && " (includes seasonal adjustment)"}
        </p>
      </CardContent>
    </Card>
  );
}

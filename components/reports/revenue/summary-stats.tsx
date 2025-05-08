"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, DollarSign, Percent } from "lucide-react";
import { Revenue } from "./types";

interface SummaryStatsProps {
  filteredRevenues: Revenue[];
  totalSales: number;
  totalMaintenance: number;
  totalSalaries: number;
  totalProfit: number;
  profitMargin: number;
  growthRate: number;
}

export function SummaryStats({
  filteredRevenues,
  totalSales,
  totalMaintenance,
  totalSalaries,
  totalProfit,
  profitMargin,
  growthRate,
}: SummaryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totalSales.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {filteredRevenues.length} records
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totalProfit.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {profitMargin.toFixed(1)}% margin
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(totalMaintenance + totalSalaries).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Maintenance: ${totalMaintenance.toLocaleString()}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
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
    </div>
  );
}

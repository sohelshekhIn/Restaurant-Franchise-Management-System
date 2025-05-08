"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3 } from "lucide-react";
import { Sale } from "./types";

interface SummaryStatsProps {
  filteredSales: Sale[];
  totalSales: number;
  averageSale: number;
  maxSale: number;
  minSale: number;
  growthRate: number;
}

export function SummaryStats({
  filteredSales,
  totalSales,
  averageSale,
  maxSale,
  minSale,
  growthRate,
}: SummaryStatsProps) {
  return (
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
          <p className="text-xs text-muted-foreground">Min - Max transaction</p>
        </CardContent>
      </Card>
    </div>
  );
}

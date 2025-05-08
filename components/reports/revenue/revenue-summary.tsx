import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Revenue, RevenueSummaryProps } from "./types";

export function RevenueSummary({ revenues }: RevenueSummaryProps) {
  const totalSales = revenues.reduce(
    (sum: number, rev: Revenue) => sum + rev.MonthlySale,
    0
  );
  const totalMaintenance = revenues.reduce(
    (sum: number, rev: Revenue) => sum + rev.MonthlyMaintenance,
    0
  );
  const totalSalaries = revenues.reduce(
    (sum: number, rev: Revenue) => sum + rev.EmployeeSalaries,
    0
  );
  const totalProfit = revenues.reduce(
    (sum: number, rev: Revenue) => sum + rev.Profit,
    0
  );
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex justify-between">
            <span>Total Sales:</span>
            <span className="font-medium">${totalSales.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Maintenance:</span>
            <span className="font-medium">
              ${totalMaintenance.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Salaries:</span>
            <span className="font-medium">
              ${totalSalaries.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Profit:</span>
            <span className="font-medium">${totalProfit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Profit Margin:</span>
            <span className="font-medium">{profitMargin.toFixed(2)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

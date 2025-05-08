import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Revenue, RevenueChartProps } from "./types";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export function RevenueChart({ revenues }: RevenueChartProps) {
  const chartData = revenues.map((revenue: Revenue) => ({
    name: revenue.Month,
    sales: revenue.MonthlySale,
    maintenance: revenue.MonthlyMaintenance,
    salaries: revenue.EmployeeSalaries,
    profit: revenue.Profit,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" name="Sales" fill="#4CAF50" />
              <Bar dataKey="maintenance" name="Maintenance" fill="#FFC107" />
              <Bar dataKey="salaries" name="Salaries" fill="#2196F3" />
              <Bar dataKey="profit" name="Profit" fill="#9C27B0" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

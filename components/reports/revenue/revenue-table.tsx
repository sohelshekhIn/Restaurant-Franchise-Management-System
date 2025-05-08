"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Revenue, RevenueTableProps } from "./types";

export function RevenueTable({ revenues }: RevenueTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Month
                </th>
                <th scope="col" className="px-6 py-3">
                  Sales
                </th>
                <th scope="col" className="px-6 py-3">
                  Maintenance
                </th>
                <th scope="col" className="px-6 py-3">
                  Salaries
                </th>
                <th scope="col" className="px-6 py-3">
                  Profit
                </th>
              </tr>
            </thead>
            <tbody>
              {revenues.map((revenue: Revenue, index: number) => (
                <tr key={index} className="bg-white border-b">
                  <td className="px-6 py-4">{revenue.Month}</td>
                  <td className="px-6 py-4">
                    ${revenue.MonthlySale.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    ${revenue.MonthlyMaintenance.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    ${revenue.EmployeeSalaries.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">${revenue.Profit.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

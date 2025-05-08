import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface InventoryChartsProps {
  inventoryData: any[];
  menuData: any[];
  dishData: any[];
}

export function InventoryCharts({
  inventoryData,
  menuData,
  dishData,
}: InventoryChartsProps) {
  // Calculate category distribution
  const categoryDistribution = inventoryData.reduce((acc: any, item) => {
    const category = item.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryDistribution).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  // Calculate price distribution
  const priceRanges = {
    "0-10": 0,
    "11-20": 0,
    "21-30": 0,
    "31-40": 0,
    "41+": 0,
  };

  inventoryData.forEach((item) => {
    const price = item.price || 0;
    if (price <= 10) priceRanges["0-10"]++;
    else if (price <= 20) priceRanges["11-20"]++;
    else if (price <= 30) priceRanges["21-30"]++;
    else if (price <= 40) priceRanges["31-40"]++;
    else priceRanges["41+"]++;
  });

  const priceData = Object.entries(priceRanges).map(([range, count]) => ({
    range,
    count,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Items" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Items" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

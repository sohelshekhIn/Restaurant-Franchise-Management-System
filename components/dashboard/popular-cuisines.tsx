"use client";

import { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface PopularCuisinesProps {
  data: {
    TypeName: string;
    RegionName: string;
    count: number;
  }[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function PopularCuisines({ data }: PopularCuisinesProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // Group by cuisine type and sum the counts
  const cuisineData = data.reduce((acc, curr) => {
    const existing = acc.find((item) => item.TypeName === curr.TypeName);
    if (existing) {
      existing.count += curr.count;
    } else {
      acc.push({ TypeName: curr.TypeName, count: curr.count });
    }
    return acc;
  }, [] as { TypeName: string; count: number }[]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={cuisineData}
          dataKey="count"
          nameKey="TypeName"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {cuisineData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

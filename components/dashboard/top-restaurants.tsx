"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const data = [
  {
    name: "Bella Italia",
    revenue: 12500,
  },
  {
    name: "Spice Garden",
    revenue: 10800,
  },
  {
    name: "Ocean Delight",
    revenue: 9600,
  },
  {
    name: "Golden Dragon",
    revenue: 8900,
  },
  {
    name: "Parisian Bistro",
    revenue: 8200,
  },
];

interface TopRestaurantsProps {
  data: {
    Name: string;
    totalSales: number;
  }[];
}

export default function TopRestaurants({ data }: TopRestaurantsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Restaurant</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((restaurant) => (
          <TableRow key={restaurant.Name}>
            <TableCell className="font-medium">{restaurant.Name}</TableCell>
            <TableCell className="text-right">
              ${restaurant.totalSales.toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

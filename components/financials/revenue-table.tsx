"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Edit, MoreHorizontal, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Revenue {
  idRevenue: number;
  RestaurantId: number;
  RestaurantName: string;
  Month: string;
  MonthlySale: number;
  MonthlyMaintenance: number;
  EmployeeSalaries: number;
  Profit: number;
}

interface Restaurant {
  id: number;
  name: string;
}

interface RevenueTableProps {
  initialRevenues: Revenue[];
  restaurants: Restaurant[];
  months: string[];
}

export function RevenueTable({
  initialRevenues,
  restaurants,
  months,
}: RevenueTableProps) {
  const [revenues, setRevenues] = useState<Revenue[]>(initialRevenues);
  const [filteredRevenues, setFilteredRevenues] =
    useState<Revenue[]>(initialRevenues);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<string>("all-restaurants");
  const [selectedMonth, setSelectedMonth] = useState<string>("all-months");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);

  useEffect(() => {
    let filtered = revenues;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((revenue) =>
        revenue.RestaurantName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply restaurant filter
    if (selectedRestaurant && selectedRestaurant !== "all-restaurants") {
      filtered = filtered.filter(
        (revenue) => revenue.RestaurantId.toString() === selectedRestaurant
      );
    }

    // Apply month filter
    if (selectedMonth && selectedMonth !== "all-months") {
      filtered = filtered.filter((revenue) => revenue.Month === selectedMonth);
    }

    setFilteredRevenues(filtered);
  }, [revenues, searchQuery, selectedRestaurant, selectedMonth]);

  const handleDelete = (id: number) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // In a real app, you would delete the record here
    console.log(`Deleting revenue record with ID: ${recordToDelete}`);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Search by restaurant name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={selectedRestaurant}
          onValueChange={setSelectedRestaurant}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select restaurant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-restaurants">All Restaurants</SelectItem>
            {restaurants.map((restaurant) => (
              <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                {restaurant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-months">All Months</SelectItem>
            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Restaurant</TableHead>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Monthly Sales</TableHead>
              <TableHead className="text-right">Maintenance</TableHead>
              <TableHead className="text-right">Salaries</TableHead>
              <TableHead className="text-right">Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRevenues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No revenue data found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRevenues.map((revenue) => (
                <TableRow key={revenue.idRevenue}>
                  <TableCell>{revenue.RestaurantName}</TableCell>
                  <TableCell>{revenue.Month}</TableCell>
                  <TableCell className="text-right">
                    ${revenue.MonthlySale.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${revenue.MonthlyMaintenance.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${revenue.EmployeeSalaries.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        revenue.Profit >= 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      ${revenue.Profit.toLocaleString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              revenue record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

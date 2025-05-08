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

interface Sale {
  SalesId: number;
  RestaurantId: number;
  RestaurantName: string;
  Date: string;
  Amount: number;
}

interface Restaurant {
  id: number;
  name: string;
}

interface SalesTableProps {
  initialSales: Sale[];
  restaurants: Restaurant[];
  dates: string[];
}

export function SalesTable({
  initialSales,
  restaurants,
  dates,
}: SalesTableProps) {
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [filteredSales, setFilteredSales] = useState<Sale[]>(initialSales);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<string>("all-restaurants");
  const [selectedDate, setSelectedDate] = useState<string>("all-dates");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);

  useEffect(() => {
    let filtered = sales;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((sale) =>
        sale.RestaurantName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply restaurant filter
    if (selectedRestaurant && selectedRestaurant !== "all-restaurants") {
      filtered = filtered.filter(
        (sale) => sale.RestaurantId.toString() === selectedRestaurant
      );
    }

    // Apply date filter
    if (selectedDate && selectedDate !== "all-dates") {
      filtered = filtered.filter(
        (sale) =>
          new Date(sale.Date).toISOString().split("T")[0] === selectedDate
      );
    }

    setFilteredSales(filtered);
  }, [sales, searchQuery, selectedRestaurant, selectedDate]);

  const handleDelete = (id: number) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // In a real app, you would delete the record here
    console.log(`Deleting sales record with ID: ${recordToDelete}`);
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
        <Select value={selectedDate} onValueChange={setSelectedDate}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-dates">All Dates</SelectItem>
            {dates.map((date) => (
              <SelectItem key={date} value={date}>
                {new Date(date).toLocaleDateString()}
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
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No sales data found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale) => (
                <TableRow key={sale.SalesId}>
                  <TableCell>{sale.RestaurantName}</TableCell>
                  <TableCell>
                    {new Date(sale.Date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${sale.Amount.toLocaleString()}
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
              sales record.
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

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Restaurant } from "./types";
import { RevenueFiltersProps } from "./types";

export function RevenueFilters({
  restaurants,
  searchQuery,
  selectedRestaurant,
  selectedMonth,
  onSearchChange,
  onRestaurantChange,
  onMonthChange,
  onExportCSV,
}: RevenueFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <div className="flex-1">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search by restaurant name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex-1">
        <Label htmlFor="restaurant">Restaurant</Label>
        <Select value={selectedRestaurant} onValueChange={onRestaurantChange}>
          <SelectTrigger id="restaurant">
            <SelectValue placeholder="Not All Restaurants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Restaurants</SelectItem>
            {restaurants.map((restaurant) => (
              <SelectItem
                key={restaurant.RestaurantId}
                value={restaurant.RestaurantId.toString()}
              >
                {restaurant.Name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Label htmlFor="month">Month</Label>
        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger id="month">
            <SelectValue placeholder="All Months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Months</SelectItem>
            <SelectItem value="January">January</SelectItem>
            <SelectItem value="February">February</SelectItem>
            <SelectItem value="March">March</SelectItem>
            <SelectItem value="April">April</SelectItem>
            <SelectItem value="May">May</SelectItem>
            <SelectItem value="June">June</SelectItem>
            <SelectItem value="July">July</SelectItem>
            <SelectItem value="August">August</SelectItem>
            <SelectItem value="September">September</SelectItem>
            <SelectItem value="October">October</SelectItem>
            <SelectItem value="November">November</SelectItem>
            <SelectItem value="December">December</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onExportCSV} className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
}

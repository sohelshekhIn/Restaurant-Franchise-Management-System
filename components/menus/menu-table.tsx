"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Menu {
  MenuId: number;
  MenuName: string;
  Description: string;
  RestaurantName: string;
  RestaurantId: number;
  DishCount: number;
}

interface MenuTableProps {
  menus: Menu[];
  restaurants: { RestaurantId: number; Name: string }[];
}

export function MenuTable({ menus, restaurants }: MenuTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("all");

  // Filter menus based on search query and selected restaurant
  const filteredMenus = menus.filter((menu) => {
    const matchesSearch =
      menu.MenuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (menu.Description &&
        menu.Description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRestaurant =
      selectedRestaurant === "all" ||
      menu.RestaurantId.toString() === selectedRestaurant;

    return matchesSearch && matchesRestaurant;
  });

  const handleDelete = async (menuId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this menu? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/menus/${menuId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete menu");
      }

      toast.success("Menu deleted successfully");

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error deleting menu:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete menu"
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Input
          placeholder="Search menus..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={selectedRestaurant}
          onValueChange={setSelectedRestaurant}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by restaurant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Restaurants</SelectItem>
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Menu Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Restaurant</TableHead>
              <TableHead>Dishes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMenus.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-lg font-medium">No menus found</p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery || selectedRestaurant !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "Add a new menu to get started"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredMenus.map((menu, index) => (
                <TableRow key={`menu-${index}-${menu.MenuId}`}>
                  <TableCell className="font-medium">{menu.MenuName}</TableCell>
                  <TableCell>{menu.Description || "No description"}</TableCell>
                  <TableCell>{menu.RestaurantName || "Not assigned"}</TableCell>
                  <TableCell>
                    {menu.DishCount} {menu.DishCount === 1 ? "dish" : "dishes"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/dishes?menuId=${menu.MenuId}`}>
                          <Utensils className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/menus/${menu.MenuId}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(menu.MenuId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

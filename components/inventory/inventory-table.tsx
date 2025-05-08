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
import { toast } from "sonner";

interface InventoryItem {
  IngredientId: number;
  MenuId: number;
  DishId: number;
  IngredientName: string;
  Price: number;
  DishName: string;
  MenuName: string;
}

interface Menu {
  id: number;
  name: string;
}

interface Dish {
  id: number;
  name: string;
}

interface InventoryTableProps {
  initialInventory: InventoryItem[];
  menus: Menu[];
  dishes: Dish[];
}

export function InventoryTable({
  initialInventory,
  menus,
  dishes,
}: InventoryTableProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [filteredInventory, setFilteredInventory] =
    useState<InventoryItem[]>(initialInventory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMenu, setSelectedMenu] = useState<string>("all-menus");
  const [selectedDish, setSelectedDish] = useState<string>("all-dishes");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  useEffect(() => {
    let filtered = inventory;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.IngredientName.toLowerCase().includes(
            searchQuery.toLowerCase()
          ) ||
          item.DishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.MenuName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply menu filter
    if (selectedMenu && selectedMenu !== "all-menus") {
      filtered = filtered.filter(
        (item) => item.MenuId.toString() === selectedMenu
      );
    }

    // Apply dish filter
    if (selectedDish && selectedDish !== "all-dishes") {
      filtered = filtered.filter(
        (item) => item.DishId.toString() === selectedDish
      );
    }

    setFilteredInventory(filtered);
  }, [inventory, searchQuery, selectedMenu, selectedDish]);

  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`/api/inventory/${itemToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete inventory item");
      }

      // Update the local state
      setInventory(
        inventory.filter((item) => item.IngredientId !== itemToDelete)
      );
      setDeleteDialogOpen(false);
      toast.success("Inventory item deleted successfully");
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      toast.error("Failed to delete inventory item. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Input
          placeholder="Search inventory..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedMenu} onValueChange={setSelectedMenu}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select menu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-menus">All Menus</SelectItem>
            {menus.map((menu) => (
              <SelectItem key={menu.id} value={menu.id.toString()}>
                {menu.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedDish} onValueChange={setSelectedDish}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select dish" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-dishes">All Dishes</SelectItem>
            {dishes.map((dish) => (
              <SelectItem key={dish.id} value={dish.id.toString()}>
                {dish.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient Name</TableHead>
              <TableHead>Dish</TableHead>
              <TableHead>Menu</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No inventory items found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item) => (
                <TableRow key={item.IngredientId}>
                  <TableCell>{item.IngredientName}</TableCell>
                  <TableCell>{item.DishName}</TableCell>
                  <TableCell>{item.MenuName}</TableCell>
                  <TableCell>${item.Price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link
                            href={`/inventory/${item.IngredientId}/edit`}
                            className="flex items-center"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(item.IngredientId)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
              This action cannot be undone. This will permanently delete the
              inventory item and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

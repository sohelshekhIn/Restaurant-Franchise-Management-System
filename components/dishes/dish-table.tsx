"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  PlusCircle,
  Edit,
  Trash,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

interface Dish {
  DishId: number;
  DishName: string;
  Description: string;
  Price: number;
  MenuId: number;
  MenuName: string;
  IngredientCount: number;
}

interface DishTableProps {
  dishes: Dish[];
  menuId?: string;
  restaurantId?: string;
}

export function DishTable({ dishes, menuId, restaurantId }: DishTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMenu, setSelectedMenu] = useState<string | undefined>(menuId);
  const [priceRange, setPriceRange] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dishToDelete, setDishToDelete] = useState<number | null>(null);

  // Get unique menu names for filtering
  const menuNames = Array.from(
    new Set(dishes.map((dish) => dish.MenuName))
  ).sort();

  // Get price ranges for filtering
  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "budget", label: "Budget ($0-$10)" },
    { value: "moderate", label: "Moderate ($10-$20)" },
    { value: "premium", label: "Premium ($20+)" },
  ];

  // Filter dishes based on search query, selected menu, and price range
  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch =
      searchQuery === "" ||
      dish.DishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dish.Description &&
        dish.Description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMenu =
      !selectedMenu ||
      selectedMenu === "all-menus" ||
      dish.MenuId.toString() === selectedMenu;

    // Price range filtering
    let matchesPrice = true;
    if (priceRange !== "all") {
      switch (priceRange) {
        case "budget":
          matchesPrice = dish.Price <= 10;
          break;
        case "moderate":
          matchesPrice = dish.Price > 10 && dish.Price <= 20;
          break;
        case "premium":
          matchesPrice = dish.Price > 20;
          break;
      }
    }

    return matchesSearch && matchesMenu && matchesPrice;
  });

  const handleDelete = (dishId: number) => {
    setDishToDelete(dishId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!dishToDelete) return;

    try {
      const response = await fetch(`/api/dishes/${dishToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete dish");
      }

      toast.success("Dish deleted successfully");
      setDeleteDialogOpen(false);
      router.refresh(); // Refresh the page to update the list
    } catch (error) {
      console.error("Error deleting dish:", error);
      toast.error("Failed to delete dish");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {!menuId && (
          <Select value={selectedMenu} onValueChange={setSelectedMenu}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by menu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-menus">All Menus</SelectItem>
              {menuNames.map((menuName) => (
                <SelectItem
                  key={menuName}
                  value={
                    dishes
                      .find((d) => d.MenuName === menuName)
                      ?.MenuId.toString() || ""
                  }
                >
                  {menuName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by price" />
          </SelectTrigger>
          <SelectContent>
            {priceRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Link
          href={`/dishes/new${
            menuId
              ? `?menuId=${menuId}`
              : restaurantId
              ? `?restaurantId=${restaurantId}`
              : ""
          }`}
        >
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Dish
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              {!menuId && <TableHead>Menu</TableHead>}
              <TableHead>Ingredients</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDishes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={menuId ? 5 : 6}
                  className="h-24 text-center"
                >
                  {searchQuery || selectedMenu || priceRange !== "all"
                    ? "No dishes found matching your criteria."
                    : "No dishes available."}
                </TableCell>
              </TableRow>
            ) : (
              filteredDishes.map((dish) => (
                <TableRow key={dish.DishId}>
                  <TableCell className="font-medium">{dish.DishName}</TableCell>
                  <TableCell>{dish.Description || "No description"}</TableCell>
                  <TableCell>${dish.Price.toFixed(2)}</TableCell>
                  {!menuId && <TableCell>{dish.MenuName}</TableCell>}
                  <TableCell>
                    <Badge variant="outline">
                      {dish.IngredientCount}{" "}
                      {dish.IngredientCount === 1
                        ? "ingredient"
                        : "ingredients"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dishes/${dish.DishId}/edit`}
                            className="flex items-center"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(dish.DishId)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
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
              dish and all associated ingredients.
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
    </div>
  );
}

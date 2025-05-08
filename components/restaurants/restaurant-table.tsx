"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Eye, MoreHorizontal, Trash, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { RestaurantList } from "@/app/restaurants/page";

interface RestaurantTableProps {
  restaurants: RestaurantList[];
  types: { TypeName: string }[];
  cities: { City: string }[];
}

export function RestaurantTable({
  restaurants,
  types,
  cities,
}: RestaurantTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const handleDelete = (id: number) => {
    setRestaurantToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Restaurant deleted successfully");
        setDeleteDialogOpen(false);
        router.refresh(); // Refresh the page to update the list
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete restaurant");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the restaurant");
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      searchQuery === "" ||
      restaurant.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.Phone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === "" || restaurant.TypeName === selectedType;

    const matchesCity = selectedCity === "" || restaurant.City === selectedCity;

    return matchesSearch && matchesType && matchesCity;
  });

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search restaurants..."
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">All Types</option>
          {types.map((type) => (
            <option key={type.TypeName} value={type.TypeName}>
              {type.TypeName}
            </option>
          ))}
        </select>
        <select
          className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city.City} value={city.City}>
              {city.City}
            </option>
          ))}
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Cuisine Type</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRestaurants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <p className="text-lg font-medium">No restaurants found</p>
                  <p className="text-sm">
                    {searchQuery || selectedType || selectedCity
                      ? "Try adjusting your search or filters"
                      : "No restaurants have been added yet"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredRestaurants.map((restaurant) => (
              <TableRow key={restaurant.RestaurantId}>
                <TableCell className="font-medium">{restaurant.Name}</TableCell>
                <TableCell>{restaurant.TypeName}</TableCell>
                <TableCell>{restaurant.Phone}</TableCell>
                <TableCell>
                  {restaurant.Street}, {restaurant.City}, {restaurant.Province}{" "}
                  {restaurant.PostalCode}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    {/* view restaurant */}
                    <DropdownMenuContent align="end">
                      <Link href={`/restaurants/${restaurant.RestaurantId}`}>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                      </Link>
                      <Link
                        href={`/dishes?restaurantId=${restaurant.RestaurantId}`}
                      >
                        <DropdownMenuItem>
                          <Utensils className="mr-2 h-4 w-4" />
                          View Dishes
                        </DropdownMenuItem>
                      </Link>
                      <Link
                        href={`/restaurants/${restaurant.RestaurantId}/edit`}
                      >
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        onClick={() => handleDelete(restaurant.RestaurantId)}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              restaurant and all associated data.
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

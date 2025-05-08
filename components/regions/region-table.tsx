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

interface Region {
  RegionId: number;
  TypeId: number;
  RegionName: string;
  Popularity: string;
  TypeName: string;
}

interface RestaurantType {
  id: number;
  name: string;
}

interface RegionTableProps {
  initialRegions: Region[];
  restaurantTypes: RestaurantType[];
}

export function RegionTable({
  initialRegions,
  restaurantTypes,
}: RegionTableProps) {
  const [regions, setRegions] = useState<Region[]>(initialRegions);
  const [filteredRegions, setFilteredRegions] =
    useState<Region[]>(initialRegions);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all-types");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [regionToDelete, setRegionToDelete] = useState<number | null>(null);

  useEffect(() => {
    let filtered = regions;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (region) =>
          region.RegionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          region.TypeName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (selectedType && selectedType !== "all-types") {
      filtered = filtered.filter(
        (region) => region.TypeId.toString() === selectedType
      );
    }

    setFilteredRegions(filtered);
  }, [regions, searchQuery, selectedType]);

  const handleDelete = (id: number) => {
    setRegionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!regionToDelete) return;

    try {
      const response = await fetch(`/api/regions/${regionToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete region");
      }

      // Update the local state
      setRegions(
        regions.filter((region) => region.RegionId !== regionToDelete)
      );
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting region:", error);

      toast.error("Failed to delete region. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Input
          placeholder="Search regions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-types">All Types</SelectItem>
            {restaurantTypes.map((type) => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Region Name</TableHead>
              <TableHead>Restaurant Type</TableHead>
              <TableHead>Popularity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  No regions found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredRegions.map((region) => (
                <TableRow key={region.RegionId}>
                  <TableCell>{region.RegionName}</TableCell>
                  <TableCell>{region.TypeName}</TableCell>
                  <TableCell>{region.Popularity}</TableCell>
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
                            href={`/regions/${region.RegionId}/edit`}
                            className="flex items-center"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(region.RegionId)}
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
              region and remove it from our servers.
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

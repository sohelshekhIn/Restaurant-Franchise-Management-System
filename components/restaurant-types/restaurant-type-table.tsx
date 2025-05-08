"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface RestaurantType {
  TypeId: number;
  TypeName: string;
  MenuName: string;
  RestaurantCount: number;
}

interface RestaurantTypeTableProps {
  restaurantTypes: RestaurantType[];
  menus: { MenuId: number; MenuName: string }[];
}

export function RestaurantTypeTable({
  restaurantTypes,
  menus,
}: RestaurantTypeTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMenu, setSelectedMenu] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<number | null>(null);

  const filteredTypes = restaurantTypes.filter((type) => {
    const matchesSearch = type.TypeName.toLowerCase().includes(
      searchQuery.toLowerCase()
    );
    const matchesMenu =
      selectedMenu === "all" ||
      type.MenuName ===
        menus.find((m) => m.MenuId.toString() === selectedMenu)?.MenuName;
    return matchesSearch && matchesMenu;
  });

  const handleDelete = async (typeId: number) => {
    setTypeToDelete(typeId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!typeToDelete) return;

    try {
      const response = await fetch(`/api/restaurant-types/${typeToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete restaurant type");
      }

      toast.success("Restaurant type deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setDeleteDialogOpen(false);
      setTypeToDelete(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Input
          placeholder="Search restaurant types..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedMenu} onValueChange={setSelectedMenu}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select menu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Menus</SelectItem>
            {menus.map((menu) => (
              <SelectItem key={menu.MenuId} value={menu.MenuId.toString()}>
                {menu.MenuName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type Name</TableHead>
              <TableHead>Menu</TableHead>
              <TableHead>Restaurants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No restaurant types found
                </TableCell>
              </TableRow>
            ) : (
              filteredTypes.map((type) => (
                <TableRow key={type.TypeId}>
                  <TableCell>{type.TypeName}</TableCell>
                  <TableCell>{type.MenuName}</TableCell>
                  <TableCell>{type.RestaurantCount}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        router.push(`/restaurant-types/${type.TypeId}/edit`)
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(type.TypeId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
              restaurant type and remove it from our servers.
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

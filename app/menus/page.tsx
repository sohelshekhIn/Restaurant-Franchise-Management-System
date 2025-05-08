import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MenuTable } from "@/components/menus/menu-table";
import { createConnection } from "@/lib/db/config";
import { RowDataPacket } from "mysql2";
import type { Metadata } from "next";

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Menus | Restaurant Management System",
  description: "Manage your menus",
};

interface Menu extends RowDataPacket {
  MenuId: number;
  MenuName: string;
  Description: string;
  RestaurantName: string;
  RestaurantId: number;
  DishCount: number;
}

interface Restaurant extends RowDataPacket {
  RestaurantId: number;
  Name: string;
}

export default async function MenusPage() {
  const connection = await createConnection();

  // Get all menus with restaurant names and dish counts
  const [menus] = await connection.execute<Menu[]>(`
    SELECT 
      m.MenuId, 
      m.MenuName, 
      m.Description,
      r.Name AS RestaurantName,
      r.RestaurantId,
      COUNT(d.DishId) AS DishCount
    FROM menu m
    LEFT JOIN restauranttype1 rt ON m.MenuId = rt.MenuId
    LEFT JOIN restaurant r ON rt.TypeId = r.RestaurantType_TypeId
    LEFT JOIN dish d ON m.MenuId = d.MenuId
    GROUP BY m.MenuId, m.MenuName, m.Description, r.Name, r.RestaurantId
    ORDER BY m.MenuName
  `);

  // Get all restaurants for the filter dropdown
  const [restaurants] = await connection.execute<Restaurant[]>(`
    SELECT RestaurantId, Name
    FROM restaurant
    ORDER BY Name
  `);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menus</h1>
          <p className="text-muted-foreground">
            Manage your restaurant menus and their dishes.
          </p>
        </div>
        <Button asChild>
          <Link href="/menus/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Menu
          </Link>
        </Button>
      </div>

      <MenuTable menus={menus} restaurants={restaurants} />
    </div>
  );
}

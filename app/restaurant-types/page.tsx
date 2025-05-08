import { executeQuery } from "@/lib/db/db";
import { RestaurantTypeTable } from "@/components/restaurant-types/restaurant-type-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RestaurantTypesPage() {
  // Fetch restaurant types with menu names and restaurant counts
  const result = await executeQuery(`
    SELECT 
      rt.TypeId,
      rt.TypeName,
      rt.MenuId,
      m.MenuName,
      COUNT(r.RestaurantId) as RestaurantCount
    FROM restauranttype1 rt
    LEFT JOIN menu m ON rt.MenuId = m.MenuId
    LEFT JOIN restaurant r ON rt.TypeId = r.TypeId
    GROUP BY rt.TypeId, rt.TypeName, rt.MenuId, m.MenuName
    ORDER BY rt.TypeName
  `);

  const restaurantTypes = result as {
    TypeId: number;
    TypeName: string;
    MenuId: number;
    MenuName: string;
    RestaurantCount: number;
  }[];

  // Fetch all menus for the filter dropdown
  const menusResult = await executeQuery(`
    SELECT MenuId, MenuName FROM menu ORDER BY MenuName
  `);

  const menus = menusResult as { MenuId: number; MenuName: string }[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Restaurant Types
          </h1>
          <p className="text-muted-foreground">
            Manage restaurant types and their associated menus
          </p>
        </div>
        <Button asChild>
          <Link href="/restaurant-types/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Restaurant Type
          </Link>
        </Button>
      </div>

      <RestaurantTypeTable restaurantTypes={restaurantTypes} menus={menus} />
    </div>
  );
}

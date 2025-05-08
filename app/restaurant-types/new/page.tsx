import { executeQuery } from "@/lib/db/db";
import { RestaurantTypeForm } from "@/components/restaurant-types/restaurant-type-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewRestaurantTypePage() {
  // Fetch all menus for the form
  const menusResult = await executeQuery(`
    SELECT MenuId, MenuName FROM menu ORDER BY MenuName
  `);

  const menus = menusResult as { MenuId: number; MenuName: string }[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/restaurant-types">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Add Restaurant Type
          </h1>
          <p className="text-muted-foreground">
            Create a new restaurant type and associate it with a menu
          </p>
        </div>
      </div>

      <RestaurantTypeForm menus={menus} />
    </div>
  );
}

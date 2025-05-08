import { executeQuery } from "@/lib/db/db";
import { RestaurantTypeForm } from "@/components/restaurant-types/restaurant-type-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

interface EditRestaurantTypePageProps {
  params: {
    typeId: string;
  };
}

export default async function EditRestaurantTypePage({
  params,
}: EditRestaurantTypePageProps) {
  const typeId = parseInt(params.typeId);

  if (isNaN(typeId)) {
    notFound();
  }

  // Fetch the restaurant type
  const [restaurantType] = (await executeQuery(
    `
    SELECT 
      rt.TypeId,
      rt.TypeName,
      rt.MenuId
    FROM restauranttype1 rt
    WHERE rt.TypeId = ?
  `,
    [typeId]
  )) as any[];

  if (!restaurantType) {
    notFound();
  }

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
            Edit Restaurant Type
          </h1>
          <p className="text-muted-foreground">
            Update restaurant type details and menu association
          </p>
        </div>
      </div>

      <RestaurantTypeForm restaurantType={restaurantType} menus={menus} />
    </div>
  );
}

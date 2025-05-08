import { executeQuery } from "@/lib/db/db";
import { InventoryTable } from "@/components/inventory/inventory-table";

interface InventoryItem {
  IngredientId: number;
  MenuId: number;
  DishId: number;
  IngredientName: string;
  Price: number;
  DishName: string;
  MenuName: string;
}

export const dynamic = "force-dynamic";
export default async function InventoryPage() {
  // Fetch inventory data from the database
  const inventory = (await executeQuery(`
    SELECT 
      i.IngredientId,
      i.MenuId,
      i.DishId,
      i.IngredientName,
      i.Price,
      d.DishName,
      m.MenuName
    FROM ingredient i
    JOIN dish d ON i.MenuId = d.MenuId AND i.DishId = d.DishId
    JOIN menu m ON d.MenuId = m.MenuId
    ORDER BY i.IngredientName ASC
  `)) as InventoryItem[];

  // Get unique menus for filter
  const menus = Array.from(new Set(inventory.map((item) => item.MenuId))).map(
    (id) => ({
      id,
      name: inventory.find((item) => item.MenuId === id)?.MenuName || "",
    })
  );

  // Get unique dishes for filter
  const dishes = Array.from(new Set(inventory.map((item) => item.DishId))).map(
    (id) => ({
      id,
      name: inventory.find((item) => item.DishId === id)?.DishName || "",
    })
  );

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Inventory</h1>
        {/* <Link href="/inventory/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Inventory Item
          </Button> */}
        {/* </Link> */}
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <InventoryTable
          initialInventory={inventory}
          menus={menus}
          dishes={dishes}
        />
      </div>
    </div>
  );
}

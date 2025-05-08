import { createConnection } from "@/lib/db/config";
import { DishTable } from "@/components/dishes/dish-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dishes | Restaurant Management System",
  description: "Manage your dishes",
};

interface Dish {
  DishId: number;
  DishName: string;
  Description: string;
  Price: number;
  MenuId: number;
  MenuName: string;
  RestaurantName: string;
  IngredientCount: number;
}

interface DishesPageProps {
  searchParams: {
    menuId?: string;
    restaurantId?: string;
  };
}

async function getDishes(
  menuId?: string,
  restaurantId?: string
): Promise<Dish[]> {
  const connection = await createConnection();

  try {
    // Modified query to show all dishes, even if not associated with a restaurant
    let query = `
      SELECT DISTINCT
        d.DishId,
        d.DishName,
        d.Description,
        d.Price,
        d.MenuId,
        m.MenuName,
        GROUP_CONCAT(DISTINCT r.Name) as RestaurantNames,
        COUNT(DISTINCT i.IngredientId) as IngredientCount
      FROM dish d
      JOIN menu m ON d.MenuId = m.MenuId
      LEFT JOIN restauranttype1 rt ON m.MenuId = rt.MenuId
      LEFT JOIN restaurant r ON rt.TypeId = r.RestaurantType_TypeId
      LEFT JOIN ingredient i ON d.MenuId = i.MenuId AND d.DishId = i.DishId
    `;

    const params: (string | number)[] = [];
    const conditions: string[] = [];

    if (menuId) {
      conditions.push("d.MenuId = ?");
      params.push(menuId);
    }

    if (restaurantId) {
      conditions.push("r.RestaurantId = ?");
      params.push(restaurantId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` GROUP BY d.DishId, d.DishName, d.Description, d.Price, d.MenuId, m.MenuName
               ORDER BY d.DishName`;

    const [dishes] = await connection.execute(query, params);

    // Process the results to format the restaurant names
    return (dishes as any[]).map((dish) => ({
      ...dish,
      RestaurantName: dish.RestaurantNames || "Not assigned to any restaurant", // Handle null case
    }));
  } finally {
    await connection.end();
  }
}

async function getRestaurantDetails(restaurantId: string) {
  const connection = await createConnection();

  try {
    const [restaurantResult] = await connection.execute(
      `SELECT RestaurantId, Name, Phone
       FROM restaurant
       WHERE RestaurantId = ?`,
      [restaurantId]
    );

    return (restaurantResult as any[])[0] || null;
  } catch (error) {
    console.error("Error fetching restaurant details:", error);
    return null;
  } finally {
    await connection.end();
  }
}

export default async function DishesPage({ searchParams }: DishesPageProps) {
  const { menuId, restaurantId } = await searchParams;
  const dishes = await getDishes(menuId, restaurantId);
  const restaurantDetails = restaurantId
    ? await getRestaurantDetails(restaurantId)
    : null;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href={restaurantId ? `/restaurants/${restaurantId}` : "/menus"}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">
            {restaurantDetails
              ? `Dishes for ${restaurantDetails.Name}`
              : menuId
              ? "Menu Dishes"
              : "All Dishes"}
          </h1>
        </div>
      </div>

      <DishTable dishes={dishes} menuId={menuId} restaurantId={restaurantId} />
    </>
  );
}

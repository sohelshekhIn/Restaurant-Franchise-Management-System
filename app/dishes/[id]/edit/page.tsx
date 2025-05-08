import { createConnection } from "@/lib/db/config";
import { DishEditForm } from "@/components/dishes/dish-edit-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Edit Dish | Restaurant Management System",
  description: "Edit dish details",
};

interface Dish {
  DishId: number;
  DishName: string;
  Description: string;
  Price: number;
  MenuId: number;
  MenuName: string;
}

async function getDishDetails(id: string): Promise<Dish | null> {
  const connection = await createConnection();

  try {
    const [dishResult] = await connection.execute(
      `SELECT d.DishId, d.DishName, d.Description, d.Price, d.MenuId, m.MenuName
       FROM dish d
       JOIN menu m ON d.MenuId = m.MenuId
       WHERE d.DishId = ?`,
      [id]
    );

    return (dishResult as any[])[0] || null;
  } catch (error) {
    console.error("Error fetching dish details:", error);
    return null;
  } finally {
    await connection.end();
  }
}

export default async function EditDishPage({
  params,
}: {
  params: { id: string };
}) {
  const dish = await getDishDetails(params.id);

  if (!dish) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dishes">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Dish Not Found</h1>
        </div>
        <p className="text-muted-foreground">
          The dish you are looking for does not exist or has been deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dishes">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Dish</h1>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">{dish.DishName}</h2>
        <p className="text-muted-foreground mb-6">Menu: {dish.MenuName}</p>
        <Suspense fallback={<div>Loading form...</div>}>
          <DishEditForm dish={dish} menus={[]} />
        </Suspense>
      </div>
    </div>
  );
}

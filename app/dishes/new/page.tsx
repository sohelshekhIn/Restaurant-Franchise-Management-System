import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DishEditForm } from "@/components/dishes/dish-edit-form";
import { createConnection } from "@/lib/db/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Dish | Restaurant Management System",
  description: "Add a new dish to the system",
};

interface Menu {
  MenuId: number;
  MenuName: string;
}

async function getMenus(): Promise<Menu[]> {
  const connection = await createConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT MenuId, MenuName 
       FROM menu 
       ORDER BY MenuName`
    );
    return rows as Menu[];
  } finally {
    await connection.end();
  }
}

export const dynamic = "force-dynamic";

export default async function NewDishPage() {
  const menus = await getMenus();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dishes"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dishes
          </Link>
          <h1 className="text-3xl font-bold">New Dish</h1>
        </div>
      </div>
      <Suspense fallback={<div>Loading form...</div>}>
        <DishEditForm menus={menus} />
      </Suspense>
    </>
  );
}

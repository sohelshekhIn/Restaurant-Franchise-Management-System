import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RestaurantForm } from "@/components/restaurants/restaurant-form";
import { createConnection } from "@/lib/db/config";

export const metadata: Metadata = {
  title: "Add Restaurant | Restaurant Management System",
  description: "Add a new restaurant to the system",
};

export const dynamic = "force-dynamic";

export default async function NewRestaurantPage() {
  const connection = await createConnection();
  try {
    // Get all restaurant types for the dropdown
    const [restaurantTypes] = (await connection.execute(
      `SELECT TypeId, TypeName FROM RestaurantType1 ORDER BY TypeName`
    )) as [{ TypeId: number; TypeName: string }[], any];

    return (
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex-1">
          <section className="w-full py-6 md:py-12">
            <div className="container px-4 md:px-6">
              <div className="flex items-center gap-4 mb-8">
                <Link href="/restaurants">
                  <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Add New Restaurant
                  </h1>
                  <p className="text-muted-foreground">
                    Create a new restaurant in the system
                  </p>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Details</CardTitle>
                  <CardDescription>
                    Enter the details for the new restaurant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RestaurantForm restaurantTypes={restaurantTypes} />
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
    );
  } finally {
    await connection.end();
  }
}

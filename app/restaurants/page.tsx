import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RestaurantTable } from "@/components/restaurants/restaurant-table";
import { createConnection } from "@/lib/db/config";
import { Restaurant } from "@/lib/db/types";

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Restaurants | Restaurant Management System",
  description: "Manage your restaurant details",
};

export interface RestaurantList extends Restaurant {
  TypeName: string;
  Street: string;
  City: string;
  Province: string;
  PostalCode: string;
}

export default async function RestaurantsPage() {
  // get name, phone, address, cusisine
  const connection = await createConnection();
  const sql = `
SELECT r.RestaurantId, r.Name, r.Phone, a.Street, a.City, a.Province, a.PostalCode, rt.TypeName
FROM Restaurant r
JOIN Address a ON r.RestaurantId = a.RestaurantId
JOIN RestaurantType1 rt ON r.RestaurantType_TypeId = rt.TypeId
ORDER BY r.Name
`;

  const [restaurantResults] = (await connection.execute(sql)) as [
    RestaurantList[],
    any
  ];

  // get all cities from address
  const [cities] = (await connection.execute(
    "SELECT DISTINCT City FROM Address ORDER BY City"
  )) as [{ City: string }[], any];

  // get all restaurant types
  const [restaurantTypes] = (await connection.execute(
    "SELECT TypeName FROM RestaurantType1 ORDER BY TypeName"
  )) as [{ TypeName: string }[], any];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1">
        <section className="w-full py-6 md:py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
              <div className="flex-1 space-y-4">
                <h1 className="inline-block text-4xl font-bold tracking-tight lg:text-5xl">
                  Restaurants
                </h1>
                <p className="text-xl text-muted-foreground">
                  Manage your restaurant details
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/restaurants/new">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Restaurant
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant List</CardTitle>
                  <CardDescription>
                    View and manage all your restaurants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RestaurantTable
                    restaurants={restaurantResults as RestaurantList[]}
                    types={restaurantTypes}
                    cities={cities}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

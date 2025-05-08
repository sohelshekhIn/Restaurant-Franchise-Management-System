import { createConnection } from "@/lib/db/config";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RestaurantEditForm } from "@/components/restaurants/restaurant-edit-form";

async function getRestaurantDetails(id: string) {
  const connection = await createConnection();
  try {
    // Get restaurant basic info with address and type
    const [restaurantResult] = await connection.execute(
      `SELECT r.*, a.Street, a.City, a.Province, a.Country, a.PostalCode, rt.TypeName
       FROM Restaurant r
       LEFT JOIN Address a ON r.AddressId = a.idAddress
       LEFT JOIN RestaurantType1 rt ON r.RestaurantType_TypeId = rt.TypeId
       WHERE r.RestaurantId = ?`,
      [id]
    );

    if (!(restaurantResult as any[]).length) {
      return null;
    }

    const restaurant = (restaurantResult as any[])[0];

    // Get all restaurant types for the dropdown
    const [typesResult] = await connection.execute(
      `SELECT TypeId, TypeName FROM RestaurantType1`
    );

    // Get all restaurant types for the dropdown
    const [restaurantTypes] = (await connection.execute(
      `SELECT TypeId, TypeName FROM RestaurantType1 ORDER BY TypeName`
    )) as [{ TypeId: number; TypeName: string }[], any];

    return [
      {
        ...restaurant,
        types: typesResult as any[],
      },
      restaurantTypes,
    ];
  } finally {
    await connection.end();
  }
}

export default async function EditRestaurantPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const restaurant = await getRestaurantDetails(id);
  if (!restaurant) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/restaurants/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Restaurant</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Restaurant Details</CardTitle>
        </CardHeader>
        <CardContent>
          <RestaurantEditForm
            restaurant={restaurant[0]}
            restaurantTypes={restaurant[1]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

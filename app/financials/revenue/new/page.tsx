import { RevenueForm } from "@/components/financials/revenue-form";
import { executeQuery } from "@/lib/db/db";

// Define types for database results
interface DbRestaurant {
  RestaurantId: number;
  Name: string;
}

export const dynamic = "force-dynamic";

export default async function NewRevenuePage() {
  // Fetch restaurants for the dropdown
  const result = (await executeQuery(`
    SELECT RestaurantId, Name
    FROM restaurant
    ORDER BY Name
  `)) as DbRestaurant[];

  const restaurants = result.map((restaurant: DbRestaurant) => ({
    id: restaurant.RestaurantId,
    name: restaurant.Name,
  }));

  // Generate list of months
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Add Revenue Record</h1>
      <div className="max-w-2xl">
        <RevenueForm restaurants={restaurants} months={months} />
      </div>
    </div>
  );
}

import { executeQuery } from "@/lib/db/db";
import { SalesForm } from "@/components/financials/sales-form";

interface Restaurant {
  id: number;
  name: string;
}

export const dynamic = "force-dynamic";

export default async function NewSalesPage() {
  // Fetch restaurants for the dropdown
  const restaurantsResult = (await executeQuery(`
    SELECT RestaurantId as id, Name as name
    FROM restaurant
    ORDER BY Name
  `)) as Restaurant[];
  const restaurants = restaurantsResult;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Add Sales Record</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <SalesForm restaurants={restaurants} />
      </div>
    </div>
  );
}

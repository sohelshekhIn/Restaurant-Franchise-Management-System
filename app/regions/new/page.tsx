import { executeQuery } from "@/lib/db/db";
import { RegionForm } from "@/components/regions/region-form";

interface RestaurantType {
  id: number;
  name: string;
}

export const dynamic = "force-dynamic";

export default async function NewRegionPage() {
  // Fetch restaurant types for the dropdown
  const restaurantTypesResult = (await executeQuery(`
    SELECT TypeId as id, TypeName as name
    FROM restauranttype1
    ORDER BY TypeName
  `)) as RestaurantType[];

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Add Region</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <RegionForm restaurantTypes={restaurantTypesResult} />
      </div>
    </div>
  );
}

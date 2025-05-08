import { executeQuery } from "@/lib/db/db";
import { RegionForm } from "@/components/regions/region-form";
import { notFound } from "next/navigation";

interface Region {
  RegionId: number;
  TypeId: number;
  RegionName: string;
  Popularity: string;
}

interface RestaurantType {
  id: number;
  name: string;
}

export default async function EditRegionPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Fetch the region data
  const regionResult = (await executeQuery(
    `
    SELECT 
      RegionId,
      TypeId,
      RegionName,
      Popularity
    FROM region
    WHERE RegionId = ?
    `,
    [id]
  )) as Region[];

  // If region not found, return 404
  if (!regionResult || regionResult.length === 0) {
    notFound();
  }

  const region = regionResult[0];

  // Fetch restaurant types for the dropdown
  const restaurantTypesResult = (await executeQuery(`
    SELECT TypeId as id, TypeName as name
    FROM restauranttype1
    ORDER BY TypeName
  `)) as RestaurantType[];

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Region</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <RegionForm region={region} restaurantTypes={restaurantTypesResult} />
      </div>
    </div>
  );
}

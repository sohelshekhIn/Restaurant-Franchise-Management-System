import { executeQuery } from "@/lib/db/db";
import { RegionTable } from "@/components/regions/region-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

interface Region {
  RegionId: number;
  TypeId: number;
  RegionName: string;
  Popularity: string;
  TypeName: string;
}

export const dynamic = "force-dynamic";
export default async function RegionsPage() {
  // Fetch regions data from the database
  const regions = (await executeQuery(`
    SELECT 
      r.RegionId,
      r.TypeId,
      r.RegionName,
      r.Popularity,
      rt.TypeName
    FROM region r
    JOIN restauranttype1 rt ON r.TypeId = rt.TypeId
    ORDER BY r.RegionName ASC
  `)) as Region[];

  // Get unique restaurant types for filter
  const restaurantTypes = Array.from(
    new Set(regions.map((region) => region.TypeId))
  ).map((id) => ({
    id,
    name: regions.find((r) => r.TypeId === id)?.TypeName || "",
  }));

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Regions</h1>
        <Link href="/regions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Region
          </Button>
        </Link>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <RegionTable
          initialRegions={regions}
          restaurantTypes={restaurantTypes}
        />
      </div>
    </div>
  );
}

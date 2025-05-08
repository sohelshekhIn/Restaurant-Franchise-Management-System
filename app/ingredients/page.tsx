import { createConnection } from "@/lib/db/config";
import { IngredientTable } from "@/components/ingredients/ingredient-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ingredients | Restaurant Management System",
  description: "Manage your ingredients",
};

// ... rest of the file remains unchanged

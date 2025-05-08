"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the form schema
const formSchema = z.object({
  RegionName: z.string().min(1, "Region name is required"),
  TypeId: z.number({
    required_error: "Restaurant type is required",
  }),
  Popularity: z.string().min(1, "Popularity is required"),
});

interface RestaurantType {
  id: number;
  name: string;
}

interface Region {
  RegionId: number;
  TypeId: number;
  RegionName: string;
  Popularity: string;
}

interface RegionFormProps {
  region?: Region;
  restaurantTypes: RestaurantType[];
  isLoading?: boolean;
  error?: string;
}

export function RegionForm({
  region,
  restaurantTypes,
  isLoading = false,
  error,
}: RegionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      RegionName: region?.RegionName || "",
      TypeId: region?.TypeId || undefined,
      Popularity: region?.Popularity || "",
    },
  });

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const url = region ? `/api/regions/${region.RegionId}` : "/api/regions";
      const method = region ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save region");
      }

      toast.success(
        region ? "Region updated successfully" : "Region created successfully"
      );
      router.push("/regions");
      router.refresh();
    } catch (error) {
      console.error("Error saving region:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save region. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="RegionName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter region name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="TypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Restaurant Type</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a restaurant type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {restaurantTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="Popularity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Popularity</FormLabel>
              <FormControl>
                <Input placeholder="Enter popularity" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/regions")}
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading
              ? "Saving..."
              : region
              ? "Update Region"
              : "Create Region"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

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
  FormDescription,
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
  RestaurantId: z.string().min(1, "Restaurant is required"),
  Month: z.string().min(1, "Month is required"),
  MonthlySale: z.string().min(1, "Monthly sale is required"),
  MonthlyMaintenance: z.string().min(1, "Maintenance cost is required"),
  EmployeeSalaries: z.string().min(1, "Employee salaries is required"),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

interface Restaurant {
  id: number;
  name: string;
}

interface RevenueFormProps {
  restaurants: Restaurant[];
  months: string[];
}

export function RevenueForm({ restaurants, months }: RevenueFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      RestaurantId: "",
      Month: "",
      MonthlySale: "",
      MonthlyMaintenance: "",
      EmployeeSalaries: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      // Convert string values to numbers
      const formData = {
        RestaurantId: parseInt(data.RestaurantId),
        Month: data.Month,
        MonthlySale: parseFloat(data.MonthlySale),
        MonthlyMaintenance: parseFloat(data.MonthlyMaintenance),
        EmployeeSalaries: parseFloat(data.EmployeeSalaries),
      };

      // Send the data to the API
      const response = await fetch("/api/revenue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create revenue record");
      }

      toast.success("Revenue record created successfully");
      router.push("/financials");
      router.refresh();
    } catch (error) {
      console.error("Error creating revenue record:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create revenue record"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="RestaurantId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Restaurant</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a restaurant" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {restaurants.map((restaurant) => (
                    <SelectItem
                      key={restaurant.id}
                      value={restaurant.id.toString()}
                    >
                      {restaurant.name}
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
          name="Month"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Month</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a month" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
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
          name="MonthlySale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Sale</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter monthly sale amount"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter the total sales for the month
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="MonthlyMaintenance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Maintenance</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter maintenance cost"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter the maintenance costs for the month
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="EmployeeSalaries"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Salaries</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter employee salaries"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter the total employee salaries for the month
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Revenue Record"}
        </Button>
      </form>
    </Form>
  );
}

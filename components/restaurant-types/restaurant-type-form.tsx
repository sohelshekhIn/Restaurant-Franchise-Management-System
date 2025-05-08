"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { toast } from "sonner";

const formSchema = z.object({
  TypeName: z.string().min(1, "Type name is required"),
  MenuId: z.string().min(1, "Menu is required"),
});

interface Menu {
  MenuId: number;
  MenuName: string;
}

interface RestaurantTypeFormProps {
  menus: Menu[];
  restaurantType?: {
    TypeId: number;
    TypeName: string;
    MenuId: number;
  };
}

export function RestaurantTypeForm({
  menus,
  restaurantType,
}: RestaurantTypeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      TypeName: restaurantType?.TypeName || "",
      MenuId: restaurantType?.MenuId.toString() || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const endpoint = restaurantType
        ? `/api/restaurant-types/${restaurantType.TypeId}`
        : "/api/restaurant-types";
      const method = restaurantType ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          TypeName: values.TypeName,
          MenuId: parseInt(values.MenuId),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }

      toast.success(
        restaurantType
          ? "Restaurant type updated successfully"
          : "Restaurant type created successfully"
      );
      router.push("/restaurant-types");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="TypeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter restaurant type name" {...field} />
              </FormControl>
              <FormDescription>
                The name of the restaurant type (e.g., Fast Food, Fine Dining)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="MenuId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Menu</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a menu" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {menus.map((menu) => (
                    <SelectItem
                      key={menu.MenuId}
                      value={menu.MenuId.toString()}
                    >
                      {menu.MenuName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The menu associated with this restaurant type
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : restaurantType
            ? "Update Restaurant Type"
            : "Create Restaurant Type"}
        </Button>
      </form>
    </Form>
  );
}

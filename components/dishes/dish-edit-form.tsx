"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { X, Plus, Loader2 } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  DishName: z.string().min(1, "Dish name is required"),
  Description: z.string().optional(),
  Price: z.coerce.number().min(0, "Price must be a positive number"),
  MenuId: z.coerce.number().min(1, "Menu is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface Ingredient {
  IngredientId?: number;
  IngredientName: string;
  Price: number;
  MenuId?: number;
  DishId?: number;
  isTemporary?: boolean;
}

interface Dish {
  DishId: number;
  DishName: string;
  Description: string;
  Price: number;
  MenuId: number;
  MenuName: string;
}

interface Menu {
  MenuId: number;
  MenuName: string;
}

interface DishEditFormProps {
  dish?: Dish;
  menus: Menu[];
}

export function DishEditForm({ dish, menus }: DishEditFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");
  const [newIngredientPrice, setNewIngredientPrice] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Get menuId from URL if present
  const urlMenuId = searchParams.get("menuId");
  const defaultMenuId = urlMenuId ? parseInt(urlMenuId) : dish?.MenuId;

  const [selectedMenuId, setSelectedMenuId] = useState<number | undefined>(
    defaultMenuId
  );

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      DishName: dish?.DishName || "",
      Description: dish?.Description || "",
      Price: dish?.Price || 0,
      MenuId: defaultMenuId || (menus.length > 0 ? menus[0].MenuId : undefined),
    },
  });

  // Update selectedMenuId when form value changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.MenuId) {
        setSelectedMenuId(value.MenuId as number);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Fetch ingredients only when editing an existing dish
  useEffect(() => {
    if (dish?.DishId) {
      const fetchIngredients = async () => {
        try {
          setIsLoadingIngredients(true);
          const response = await fetch(
            `/api/dishes/${dish.DishId}/ingredients`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch ingredients");
          }
          const data = await response.json();
          setIngredients(data);
        } catch (error) {
          console.error("Error fetching ingredients:", error);
          toast.error("Failed to load ingredients");
        } finally {
          setIsLoadingIngredients(false);
        }
      };

      fetchIngredients();
    }
  }, [dish?.DishId]);

  // Generate suggestions based on input
  useEffect(() => {
    if (newIngredient.length > 0) {
      const filtered = ingredients
        .map((i) => i.IngredientName)
        .filter((name) =>
          name.toLowerCase().includes(newIngredient.toLowerCase())
        );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [newIngredient, ingredients]);

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      const endpoint = dish ? `/api/dishes/${dish.DishId}` : "/api/dishes";
      const method = dish ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          MenuId: data.MenuId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save dish");
      }

      const savedDish = await response.json();

      // If this is a new dish and we have temporary ingredients, add them
      if (!dish && ingredients.length > 0) {
        // Add each ingredient to the newly created dish
        for (const ingredient of ingredients) {
          if (ingredient.isTemporary) {
            await fetch(`/api/dishes/${savedDish.DishId}/ingredients`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                IngredientName: ingredient.IngredientName,
                Price: ingredient.Price,
                MenuId: savedDish.MenuId,
              }),
            });
          }
        }
      }

      toast.success(
        dish ? "Dish updated successfully" : "Dish created successfully"
      );
      router.push("/dishes");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddIngredient() {
    if (!newIngredient.trim()) return;

    setIsAddingIngredient(true);
    try {
      if (dish?.DishId) {
        // For existing dishes, add ingredient via API
        const response = await fetch(`/api/dishes/${dish.DishId}/ingredients`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            IngredientName: newIngredient,
            Price: newIngredientPrice ? parseFloat(newIngredientPrice) : 0,
            MenuId: dish.MenuId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add ingredient");
        }

        const newIngredientData = await response.json();

        // Ensure the new ingredient data has the correct structure
        const formattedIngredient = {
          IngredientId: newIngredientData.IngredientId,
          IngredientName: newIngredientData.IngredientName || newIngredient,
          Price:
            newIngredientData.Price ||
            (newIngredientPrice ? parseFloat(newIngredientPrice) : 0),
          MenuId: newIngredientData.MenuId || dish.MenuId,
          DishId: newIngredientData.DishId || dish.DishId,
        };

        setIngredients([...ingredients, formattedIngredient]);
      } else {
        // For new dishes, add ingredient to local state
        const newIngredientData: Ingredient = {
          IngredientName: newIngredient,
          Price: newIngredientPrice ? parseFloat(newIngredientPrice) : 0,
          MenuId: selectedMenuId,
          isTemporary: true,
        };

        setIngredients([...ingredients, newIngredientData]);
      }

      setNewIngredient("");
      setNewIngredientPrice("");
      toast.success("Ingredient added successfully");
    } catch (error) {
      console.error("Error adding ingredient:", error);
      toast.error("Failed to add ingredient");
    } finally {
      setIsAddingIngredient(false);
    }
  }

  async function handleDeleteIngredient(ingredientId?: number) {
    try {
      if (dish?.DishId && ingredientId) {
        // For existing dishes, delete ingredient via API
        const response = await fetch(
          `/api/dishes/${dish.DishId}/ingredients?ingredientId=${ingredientId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete ingredient");
        }

        setIngredients(
          ingredients.filter((i) => i.IngredientId !== ingredientId)
        );
      } else {
        // For new dishes, remove ingredient from local state
        setIngredients(
          ingredients.filter((_, index) => index !== ingredientId)
        );
      }

      toast.success("Ingredient deleted successfully");
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      toast.error("Failed to delete ingredient");
    }
  }

  const handleSelectSuggestion = (suggestion: string) => {
    setNewIngredient(suggestion);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        // If there are suggestions, select the first one
        handleSelectSuggestion(suggestions[0]);
      } else if (newIngredient.trim()) {
        // If no suggestions but we have text, try to add the ingredient
        handleAddIngredient();
      }
    }
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (newIngredient.trim()) {
        handleAddIngredient();
      }
    }
  };

  // If not mounted yet, return null to prevent hydration errors
  if (!isMounted) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="DishName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dish Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter dish name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="Description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter dish description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="Price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
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
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
              >
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
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Ingredients</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Ingredient
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Ingredient Name
                    </label>
                    <div className="relative">
                      <Input
                        value={newIngredient}
                        onChange={(e) => setNewIngredient(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type ingredient name"
                        className="pr-8"
                      />
                      {suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                          {suggestions.map((suggestion) => (
                            <div
                              key={suggestion}
                              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleSelectSuggestion(suggestion)}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Price (optional)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newIngredientPrice}
                      onChange={(e) => setNewIngredientPrice(e.target.value)}
                      onKeyDown={handlePriceKeyDown}
                      placeholder="Enter ingredient price"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddIngredient}
                    disabled={isAddingIngredient || !newIngredient.trim()}
                    className="w-full"
                  >
                    {isAddingIngredient ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Ingredient"
                    )}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {isLoadingIngredients ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : ingredients.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient, index) => (
                <Badge
                  key={ingredient.IngredientId || index}
                  variant="secondary"
                  className="flex items-center gap-1 py-1 px-3"
                >
                  <span>{ingredient.IngredientName}</span>
                  {ingredient.Price > 0 && (
                    <span className="text-xs text-muted-foreground">
                      (${ingredient.Price.toFixed(2)})
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                    onClick={() =>
                      handleDeleteIngredient(ingredient.IngredientId || index)
                    }
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No ingredients added yet. Click "Add Ingredient" to add
              ingredients to this dish.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : dish ? "Save Changes" : "Create Dish"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

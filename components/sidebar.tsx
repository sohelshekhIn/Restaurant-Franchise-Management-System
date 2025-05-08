"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  ChefHat,
  DollarSign,
  Home,
  Info,
  MapPin,
  MenuIcon,
  Package,
  RectangleEllipsis,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <ChefHat className="h-6 w-6" />
            <span>Restaurant MS</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link href="/">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  pathname === "/" && "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/restaurants">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  pathname === "/restaurants" && "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <Building2 className="h-4 w-4" />
                Restaurants
              </Button>
            </Link>
            <Link href="/restaurant-types">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  pathname === "/restaurant-types" &&
                    "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <RectangleEllipsis className="h-4 w-4" />
                Restaurant Types
              </Button>
            </Link>

            <Link href="/menus">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  pathname === "/menus" && "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <MenuIcon className="h-4 w-4" />
                Menus & Dishes
              </Button>
            </Link>
            <Link href="/employees">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  pathname === "/employees" && "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <Users className="h-4 w-4" />
                Employees
              </Button>
            </Link>
            <Link href="/financials">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  pathname === "/financials" && "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <DollarSign className="h-4 w-4" />
                Financials
              </Button>
            </Link>
            <Link href="/regions">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  pathname === "/regions" && "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <MapPin className="h-4 w-4" />
                Regions
              </Button>
            </Link>
            <Link href="/inventory">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  pathname === "/inventory" && "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <Package className="h-4 w-4" />
                Inventory
              </Button>
            </Link>
            <Link href="/reports">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  pathname === "/reports" && "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <BarChart3 className="h-4 w-4" />
                Reports
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  pathname === "/about" && "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <Info className="h-4 w-4" />
                About
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}

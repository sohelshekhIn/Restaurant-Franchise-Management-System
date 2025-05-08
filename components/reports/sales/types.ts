export interface Sale {
  SalesId: number;
  RestaurantId: number;
  Date: string;
  Amount: number;
  RestaurantName: string;
}

export interface Restaurant {
  RestaurantId: number;
  Name: string;
}

export interface RestaurantSales {
  name: string;
  total: number;
  count: number;
}

export interface ChartData {
  name: string;
  sales: number;
}

export interface ComparisonData {
  name: string;
  current: number;
  previous: number;
}

export interface Recommendation {
  title: string;
  content: string;
}

export type TimeFrame = "week" | "month" | "quarter" | "year";
export type GroupBy = "day" | "week" | "month" | "restaurant";

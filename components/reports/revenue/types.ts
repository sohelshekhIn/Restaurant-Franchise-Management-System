export interface Revenue {
  idRevenue: number;
  RestaurantId: number;
  Month: string;
  MonthlySale: number;
  MonthlyMaintenance: number;
  EmployeeSalaries: number;
  Profit: number;
  RestaurantName: string;
}

export interface Restaurant {
  RestaurantId: number;
  Name: string;
}

export interface RestaurantRevenue {
  name: string;
  totalSales: number;
  totalMaintenance: number;
  totalSalaries: number;
  totalProfit: number;
  count: number;
}

export type GroupBy = "month" | "restaurant";

export interface ChartData {
  name: string;
  sales?: number;
  maintenance?: number;
  salaries?: number;
  profit?: number;
  actual?: number;
  trend?: number;
  average?: number;
  forecast?: number;
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

export type TimeFrame = "month" | "quarter" | "year";

export interface RevenueFiltersProps {
  restaurants: Restaurant[];
  searchQuery: string;
  selectedRestaurant: string;
  selectedMonth: string;
  onSearchChange: (value: string) => void;
  onRestaurantChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onExportCSV: () => void;
}

export interface RevenueTableProps {
  revenues: Revenue[];
}

export interface RevenueChartProps {
  revenues: Revenue[];
}

export interface SummaryStatsProps {
  filteredRevenues: Revenue[];
  totalSales: number;
  totalMaintenance: number;
  totalSalaries: number;
  totalProfit: number;
  profitMargin: number;
  growthRate: number;
}

export interface RevenueForecastProps {
  filteredRevenues: Revenue[];
  growthRate: number;
  timeFrame: TimeFrame;
}

export interface RevenueSummaryProps {
  revenues: Revenue[];
}

export interface TrendData {
  months: string[];
  salesByMonth: number[];
  slope: number;
  intercept: number;
}

export interface SeasonalityData {
  [key: string]: number;
}

export interface RevenueChartsProps {
  revenues: Revenue[];
  restaurants: Restaurant[];
  showTrends: boolean;
  showSeasonality: boolean;
  trendData?: TrendData | null;
  seasonalityData?: SeasonalityData | null;
}

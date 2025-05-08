// Database table interfaces
export interface Menu {
  MenuId: number;
  MenuName: string | null;
  Description: string | null;
}

export interface RestaurantType {
  TypeId: number;
  MenuId: number;
  TypeName: string | null;
}

export interface Restaurant {
  RestaurantId: number;
  Name: string;
  TypeId: number;
  Phone: string;
  AddressId: number;
  RestaurantType_TypeId: number;
}

export interface Address {
  idAddress: number;
  Street: string | null;
  City: string | null;
  Province: string | null;
  Country: string | null;
  PostalCode: string | null;
  RestaurantId: number;
}

export interface Department {
  DepartmentId: number;
  DepartmentName: string | null;
}

export interface Employee {
  EmployeeId: number;
  RestaurantId: number;
  firstName: string | null;
  lastName: string | null;
  MonthlySalary: string | null;
  joinDate: Date | null;
  ManagerId: number | null;
  DepartmentId: number;
}

export interface Sales {
  SalesId: number;
  RestaurantId: number;
  Date: Date | null;
  Amount: number | null;
}

export interface Revenue {
  idRevenue: number;
  RestaurantId: number;
  Month: string | null;
  MonthlySale: number | null;
  MonthlyMaintenance: number | null;
  EmployeeSalaries: number | null;
  Profit: number | null;
}

export interface Region {
  RegionId: number;
  TypeId: number;
  RegionName: string | null;
  Popularity: string | null;
}

export interface Dish {
  MenuId: number;
  DishId: number;
  DishName: string | null;
  Description: string | null;
  Price: number | null;
}

export interface Ingredient {
  MenuId: number;
  DishId: number;
  IngredientName: string | null;
  IngredientId: number;
  Price: number | null;
}

-- Department Data
INSERT INTO department (DepartmentId, DepartmentName) VALUES
(1, 'Kitchen Staff'),
(2, 'Service Staff'),
(3, 'Management'),
(4, 'Maintenance'),
(5, 'Administration');

-- Restaurant Types (Franchise Concepts)
INSERT INTO restauranttype1 (TypeId, TypeName) VALUES
(1, 'Pizza Palace'),
(2, 'Dragon Express'),
(3, 'Spice Garden'),
(4, 'Sushi Master'),
(5, 'Maple Diner'),
(6, 'Mediterranean Grill'),
(7, 'Taco Fiesta');

-- Menu Data (Franchise Menus)
INSERT INTO menu (MenuId, MenuName, Description) VALUES
(1, 'Pizza Palace Menu', 'Signature pizzas, pasta, and Italian favorites'),
(2, 'Dragon Express Menu', 'Quick-service Chinese cuisine and dim sum'),
(3, 'Spice Garden Menu', 'Authentic Indian dishes with regional specialties'),
(4, 'Sushi Master Menu', 'Fresh sushi, sashimi, and Japanese specialties'),
(5, 'Maple Diner Menu', 'Canadian comfort food with local ingredients'),
(6, 'Mediterranean Grill Menu', 'Fresh Mediterranean dishes and grilled specialties'),
(7, 'Taco Fiesta Menu', 'Authentic Mexican street food and specialties');

-- Link Restaurant Types to Menus (Franchise Concept to Menu)
INSERT INTO restauranttype1 (TypeId, MenuId) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7);

-- Region Data (GTA Regions)
INSERT INTO region (RegionId, TypeId, RegionName, Popularity) VALUES
(1, 1, 'Downtown Toronto', 'High'),
(2, 2, 'Markham', 'High'),
(3, 3, 'Brampton', 'Medium'),
(4, 4, 'North York', 'High'),
(5, 5, 'Mississauga', 'High'),
(6, 6, 'Scarborough', 'Medium'),
(7, 7, 'Etobicoke', 'Medium');

-- Address Data (Franchise Locations)
INSERT INTO address (idAddress, Street, City, Province, Country, PostalCode, RestaurantId) VALUES
(1, '123 King St W', 'Toronto', 'Ontario', 'Canada', 'M5V 1J2', 1),
(2, '456 Highway 7', 'Markham', 'Ontario', 'Canada', 'L3P 1M8', 2),
(3, '789 Queen St', 'Brampton', 'Ontario', 'Canada', 'L6Y 1L8', 3),
(4, '234 Yonge St', 'Toronto', 'Ontario', 'Canada', 'M2N 5P7', 4),
(5, '567 Burnhamthorpe Rd', 'Mississauga', 'Ontario', 'Canada', 'L5B 2C9', 5),
(6, '890 Lawrence Ave E', 'Toronto', 'Ontario', 'Canada', 'M1H 1A3', 6),
(7, '432 The Queensway', 'Toronto', 'Ontario', 'Canada', 'M8Y 1J3', 7),
(8, '765 College St', 'Toronto', 'Ontario', 'Canada', 'M6G 1C5', 8),
(9, '321 Kennedy Rd', 'Richmond Hill', 'Ontario', 'Canada', 'L4B 1J8', 9),
(10, '654 Main St', 'Mississauga', 'Ontario', 'Canada', 'L5B 4K3', 10),
(11, '987 Queen St W', 'Toronto', 'Ontario', 'Canada', 'M6J 1G1', 11),
(12, '147 Lakeshore Rd', 'Oakville', 'Ontario', 'Canada', 'L6J 1J3', 12),
(13, '258 Hwy 7', 'Vaughan', 'Ontario', 'Canada', 'L4H 3M7', 13),
(14, '369 Brant St', 'Burlington', 'Ontario', 'Canada', 'L7R 2G8', 14),
(15, '741 St. Clair Ave W', 'Toronto', 'Ontario', 'Canada', 'M6C 1B6', 15);

-- Restaurant Data (Franchise Locations)
INSERT INTO restaurant (RestaurantId, Name, TypeId, Phone, AddressId, RestaurantType_TypeId) VALUES
(1, 'Pizza Palace - King Street', 1, '416-555-0101', 1, 1),
(2, 'Dragon Express - Markham', 2, '905-555-0102', 2, 2),
(3, 'Spice Garden - Brampton', 3, '905-555-0103', 3, 3),
(4, 'Sushi Master - North York', 4, '416-555-0104', 4, 4),
(5, 'Maple Diner - Mississauga', 5, '905-555-0105', 5, 5),
(6, 'Mediterranean Grill - Scarborough', 6, '416-555-0106', 6, 6),
(7, 'Taco Fiesta - Etobicoke', 7, '416-555-0107', 7, 7),
(8, 'Pizza Palace - College', 1, '416-555-0108', 8, 1),
(9, 'Dragon Express - Richmond Hill', 2, '905-555-0109', 9, 2),
(10, 'Spice Garden - Mississauga', 3, '905-555-0110', 10, 3),
(11, 'Sushi Master - Downtown', 4, '416-555-0111', 11, 4),
(12, 'Maple Diner - Oakville', 5, '905-555-0112', 12, 5),
(13, 'Mediterranean Grill - Vaughan', 6, '905-555-0113', 13, 6),
(14, 'Taco Fiesta - Burlington', 7, '905-555-0114', 14, 7),
(15, 'Pizza Palace - St. Clair', 1, '416-555-0115', 15, 1);

-- Employee Data (Franchise Staff)
INSERT INTO employee (EmployeeId, RestaurantId, firstName, lastName, MonthlySalary, joinDate, ManagerId, DepartmentId) VALUES
-- Managers (no ManagerId)
(1, 1, 'Marco', 'Rossi', '7500', '2022-01-15', NULL, 3),
(2, 2, 'Li', 'Wei', '7200', '2022-02-01', NULL, 3),
(3, 3, 'Raj', 'Patel', '7300', '2022-01-10', NULL, 3),
(4, 4, 'Yuki', 'Tanaka', '7400', '2022-03-01', NULL, 3),
(5, 5, 'John', 'Smith', '7100', '2022-02-15', NULL, 3),

-- Regular Employees
(6, 1, 'Sofia', 'Conti', '4500', '2022-04-01', 1, 1),
(7, 1, 'Luigi', 'Bianchi', '3800', '2022-04-15', 1, 2),
(8, 2, 'Chen', 'Xiao', '4200', '2022-05-01', 2, 1),
(9, 2, 'Zhang', 'Min', '3700', '2022-05-15', 2, 2),
(10, 3, 'Priya', 'Singh', '4100', '2022-03-15', 3, 1),
(11, 3, 'Arun', 'Kumar', '3900', '2022-04-01', 3, 2),
(12, 4, 'Kenji', 'Sato', '4300', '2022-06-01', 4, 1),
(13, 4, 'Akiko', 'Yamamoto', '3800', '2022-06-15', 4, 2),
(14, 5, 'Sarah', 'Johnson', '4000', '2022-05-01', 5, 1),
(15, 5, 'Michael', 'Williams', '3700', '2022-05-15', 5, 2);

-- Dish Data (Franchise Menu Items)
INSERT INTO dish (DishId, MenuId, DishName, Description, Price) VALUES
(1, 1, 'Classic Pepperoni Pizza', 'Signature pizza with pepperoni and mozzarella', 18),
(2, 1, 'Spaghetti Carbonara', 'Creamy pasta with pancetta and egg', 22),
(3, 2, 'Dragon Express Combo', 'Chicken, beef, and shrimp with vegetables', 16),
(4, 2, 'Dim Sum Platter', 'Assorted dim sum favorites', 24),
(5, 3, 'Butter Chicken', 'Creamy tomato-based curry with chicken', 20),
(6, 3, 'Vegetable Biryani', 'Fragrant rice with mixed vegetables', 18),
(7, 4, 'Sushi Master Platter', 'Assorted sushi and sashimi', 28),
(8, 4, 'Tempura Udon', 'Crispy tempura with udon noodles', 22),
(9, 5, 'Maple Bacon Poutine', 'Fries with gravy, cheese curds, and maple bacon', 14),
(10, 5, 'Canadian Club Sandwich', 'Triple-decker with turkey, bacon, and maple mayo', 16),
(11, 6, 'Mediterranean Platter', 'Hummus, tabbouleh, falafel, and pita', 20),
(12, 6, 'Grilled Salmon Plate', 'Fresh salmon with Mediterranean herbs', 24),
(13, 7, 'Taco Fiesta Platter', 'Assorted tacos with rice and beans', 22),
(14, 7, 'Churros with Chocolate', 'Crispy churros with chocolate dipping sauce', 10),
(15, 1, 'Chocolate Lava Cake', 'Warm chocolate cake with vanilla ice cream', 12);

-- Ingredient Data (Franchise Ingredients)
INSERT INTO ingredient (IngredientId, MenuId, DishId, IngredientName, Price) VALUES
(1, 1, 1, 'Pepperoni', 5),
(2, 1, 1, 'Pizza Dough', 3),
(3, 1, 2, 'Spaghetti', 3),
(4, 1, 2, 'Pancetta', 6),
(5, 2, 3, 'Chicken Breast', 6),
(6, 2, 3, 'Beef Strips', 7),
(7, 2, 4, 'Shrimp', 8),
(8, 3, 5, 'Chicken Thighs', 5),
(9, 3, 5, 'Heavy Cream', 4),
(10, 3, 6, 'Basmati Rice', 4),
(11, 4, 7, 'Fresh Salmon', 10),
(12, 4, 7, 'Sushi Rice', 5),
(13, 5, 9, 'Cheese Curds', 5),
(14, 5, 10, 'Turkey Breast', 6),
(15, 6, 11, 'Chickpeas', 3);

-- Revenue Data (Last 3 months for each franchise location)
INSERT INTO revenue (idRevenue, RestaurantId, Month, MonthlySale, MonthlyMaintenance, EmployeeSalaries, Profit) VALUES
(1, 1, '2024-01', 85000, 5000, 15800, 64200),
(2, 1, '2024-02', 82000, 4800, 15800, 61400),
(3, 1, '2024-03', 88000, 5200, 15800, 67000),
(4, 2, '2024-01', 78000, 4800, 15100, 58100),
(5, 2, '2024-02', 75000, 4600, 15100, 55300),
(6, 2, '2024-03', 80000, 5000, 15100, 59900),
(7, 3, '2024-01', 72000, 4500, 15300, 52200),
(8, 3, '2024-02', 70000, 4400, 15300, 50300),
(9, 3, '2024-03', 74000, 4600, 15300, 54100),
(10, 4, '2024-01', 82000, 5100, 15500, 61400),
(11, 4, '2024-02', 80000, 4900, 15500, 59600),
(12, 4, '2024-03', 85000, 5300, 15500, 64200),
(13, 5, '2024-01', 68000, 4200, 14800, 49000),
(14, 5, '2024-02', 65000, 4000, 14800, 46200),
(15, 5, '2024-03', 70000, 4400, 14800, 50800);

-- Sales Data (Recent daily sales for each franchise location)
INSERT INTO sales (SalesId, RestaurantId, Date, Amount) VALUES
(1, 1, '2024-03-15', 3200),
(2, 1, '2024-03-16', 3500),
(3, 1, '2024-03-17', 2800),
(4, 2, '2024-03-15', 2900),
(5, 2, '2024-03-16', 3100),
(6, 2, '2024-03-17', 2600),
(7, 3, '2024-03-15', 2700),
(8, 3, '2024-03-16', 2900),
(9, 3, '2024-03-17', 2400),
(10, 4, '2024-03-15', 3100),
(11, 4, '2024-03-16', 3300),
(12, 4, '2024-03-17', 2700),
(13, 5, '2024-03-15', 2500),
(14, 5, '2024-03-16', 2800),
(15, 5, '2024-03-17', 2200);

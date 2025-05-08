# Restaurant Management System

A comprehensive system for managing restaurants, menus, dishes, employees, and more.

## Features

- Restaurant management (CRUD operations)
- Menu and dish management
- Employee management
- Revenue tracking
- Search and filtering capabilities
- Modern UI with ShadCn components

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: ShadCn UI
- **Database**: MySQL
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/sohelshekhIn/Restaurant-Franchise-Management-System.git
   cd Restaurant-Franchise-Management-System
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following content:

   ```
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=rms
   DB_PORT=3306
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   ```

4. Set up the database:

   - Create a MySQL database named `rms`
   - Import the database schema from the `schema.sql` file

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/app
  /api                 # API routes
  /restaurants         # Restaurant pages
  /menus               # Menu pages
  /dishes              # Dish pages
  /employees           # Employee pages
/components
  /ui                  # UI components
  /restaurants         # Restaurant-specific components
  /menus               # Menu-specific components
/lib
  /db.ts               # Database connection
```

## Database Schema

The system uses a relational database with the following main tables:

- `restaurant`: Stores restaurant information
- `menu`: Stores menu information
- `dish`: Stores dish information
- `employee`: Stores employee information
- `address`: Stores address information
- `department`: Stores department information
- `revenue`: Stores revenue information
- `sales`: Stores sales information

## License

This project is licensed under the MIT License - see the LICENSE file for details.

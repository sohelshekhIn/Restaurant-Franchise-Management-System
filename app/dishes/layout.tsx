import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dishes | Restaurant Management System",
  description: "Manage your dishes",
};

export default function DishesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="container mx-auto py-6 md:py-12
    px-6 md:px-12
    "
    >
      {children}
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restaurants | Restaurant Management System",
  description: "Manage your restaurants",
};

export default function RestaurantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="container mx-auto py-6 md:py-12
    px-6 md:px-12
    "
    >
      {children}
    </main>
  );
}

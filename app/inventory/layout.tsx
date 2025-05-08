import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventory | Restaurant Management System",
  description: "Manage your inventory",
};

export default function InventoryLayout({
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

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menus | Restaurant Management System",
  description: "Manage your menus",
};

export default function MenusLayout({
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

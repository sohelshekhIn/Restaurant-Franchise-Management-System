import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Restaurant Management System",
  description: "About the Restaurant Management System",
};

export default function AboutLayout({
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

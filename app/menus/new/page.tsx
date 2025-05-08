import { MenuEditForm } from "@/components/menus/menu-edit-form";

export const dynamic = "force-dynamic";

export default function NewMenuPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Menu</h1>
        <p className="text-muted-foreground">
          Add a new menu to your restaurant management system.
        </p>
      </div>
      <MenuEditForm />
    </div>
  );
}

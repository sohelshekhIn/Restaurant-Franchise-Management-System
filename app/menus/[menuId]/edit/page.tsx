import { notFound } from "next/navigation";
import { MenuEditForm } from "@/components/menus/menu-edit-form";
import { createConnection } from "@/lib/db/config";
import { RowDataPacket } from "mysql2";

interface Menu extends RowDataPacket {
  MenuId: number;
  MenuName: string;
  Description: string;
}

interface EditMenuPageProps {
  params: {
    menuId: string;
  };
}

export default async function EditMenuPage({ params }: EditMenuPageProps) {
  const menuId = parseInt(params.menuId);

  if (isNaN(menuId)) {
    notFound();
  }

  const connection = await createConnection();
  const [rows] = await connection.execute<Menu[]>(
    "SELECT MenuId, MenuName, Description FROM menu WHERE MenuId = ?",
    [menuId]
  );

  if (!rows || rows.length === 0) {
    notFound();
  }

  // Convert null Description to empty string to match form expectations
  const menu = {
    ...rows[0],
    Description: rows[0].Description || "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Menu</h1>
        <p className="text-muted-foreground">
          Update the details of your menu.
        </p>
      </div>
      <MenuEditForm menu={menu} />
    </div>
  );
}

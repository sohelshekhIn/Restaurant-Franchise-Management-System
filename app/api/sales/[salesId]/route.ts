import { NextResponse } from "next/server";
import { z } from "zod";
import { executeQuery } from "@/lib/db/db";

const salesSchema = z.object({
  RestaurantId: z.number().min(1, "Restaurant ID is required"),
  Date: z.string().min(1, "Date is required"),
  Amount: z.number().min(0, "Amount must be a positive number"),
});

export async function PATCH(
  request: Request,
  { params }: { params: { salesId: string } }
) {
  try {
    const salesId = parseInt(params.salesId);
    if (isNaN(salesId)) {
      return NextResponse.json({ error: "Invalid sales ID" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = salesSchema.parse(body);

    const query = `
      UPDATE sales
      SET 
        RestaurantId = ?,
        Date = ?,
        Amount = ?
      WHERE SalesId = ?
    `;

    await executeQuery(query, [
      validatedData.RestaurantId,
      validatedData.Date,
      validatedData.Amount,
      salesId,
    ]);

    return NextResponse.json(
      { message: "Sales record updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating sales record:", error);
    return NextResponse.json(
      { error: "Failed to update sales record" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { salesId: string } }
) {
  try {
    const salesId = parseInt(params.salesId);
    if (isNaN(salesId)) {
      return NextResponse.json({ error: "Invalid sales ID" }, { status: 400 });
    }

    const query = "DELETE FROM sales WHERE SalesId = ?";
    await executeQuery(query, [salesId]);

    return NextResponse.json(
      { message: "Sales record deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting sales record:", error);
    return NextResponse.json(
      { error: "Failed to delete sales record" },
      { status: 500 }
    );
  }
}

// handle post request for new restaurant

import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db/config";

export async function POST(request: Request) {
  const connection = await createConnection();
  const body = await request.json();
  const { name, type, phone, street, city, province, country, postalCode } =
    body;

  //   a transaction where we add restaurant, address, restaurant type
  try {
    await connection.beginTransaction();

    // First, check if the restaurant type exists
    const [existingTypeResult] = await connection.execute(
      "SELECT TypeId FROM RestaurantType1 WHERE TypeName = ?",
      [type]
    );

    let typeId;

    if ((existingTypeResult as any[]).length > 0) {
      // Type exists, use its ID
      typeId = (existingTypeResult as any[])[0].TypeId;
    } else {
      // Type doesn't exist, create it
      // Generate a unique TypeId
      const [maxTypeIdResult] = await connection.execute(
        "SELECT MAX(TypeId) as maxId FROM RestaurantType1"
      );
      const maxTypeId = (maxTypeIdResult as any[])[0].maxId || 0;
      typeId = maxTypeId + 1;

      // Insert the new type
      await connection.execute(
        "INSERT INTO RestaurantType1 (TypeId, MenuId, TypeName) VALUES (?, ?, ?)",
        [typeId, 0, type]
      );
    }

    // Generate a unique RestaurantId
    const [maxIdResult] = await connection.execute(
      "SELECT MAX(RestaurantId) as maxId FROM Restaurant"
    );
    const maxId = (maxIdResult as any[])[0].maxId || 0;
    const newRestaurantId = maxId + 1;

    // Generate a unique AddressId
    const [maxAddressIdResult] = await connection.execute(
      "SELECT MAX(idAddress) as maxId FROM Address"
    );
    const maxAddressId = (maxAddressIdResult as any[])[0].maxId || 0;
    const newAddressId = maxAddressId + 1;

    // Insert into Restaurant with the generated ID and a temporary AddressId
    // We'll update this later after creating the address
    await connection.execute(
      "INSERT INTO Restaurant (RestaurantId, Name, TypeId, Phone, AddressId, RestaurantType_TypeId) VALUES (?, ?, ?, ?, ?, ?)",
      [newRestaurantId, name, typeId, phone, newAddressId, typeId]
    );

    // Now insert into Address with the generated ID and RestaurantId
    await connection.execute(
      "INSERT INTO Address (idAddress, Street, City, Province, Country, PostalCode, RestaurantId) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        newAddressId,
        street,
        city,
        province,
        country,
        postalCode,
        newRestaurantId,
      ]
    );

    await connection.commit();
    return NextResponse.json({
      message: "Restaurant created successfully",
      restaurantId: newRestaurantId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating restaurant:", error);
    return NextResponse.json(
      { error: "Failed to create restaurant" },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

import { createConnection } from "./config";

export async function executeQuery<T>(
  sql: string,
  params: any[] = []
): Promise<T> {
  const connection = await createConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results as T;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Example of how to use the executeQuery function:
/*
const sql = `
  SELECT * FROM users 
  WHERE email = ? AND status = ?
`;
const params = ['user@example.com', 'active'];
const users = await executeQuery(sql, params);
*/

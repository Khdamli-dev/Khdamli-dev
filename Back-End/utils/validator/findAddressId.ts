import pool from "../../database/dbConnection";
import address from "../../interface/address";

const findAddressId = async ({ region, city, street, addressNumber }: address): Promise<number> => {
  try {
    const result = await pool.query(`
      SELECT id FROM address WHERE 
      region = $1 
      AND city = $2 
      AND street = $3 
      AND address_number = $4
    `, [region, city, street, addressNumber]);

    // If no rows are returned, return 0
    if (result.rows.length === 0) {
      return 0;
    }

    // If rows are returned, return the id of the existing address
    return result.rows[0]?.id || 0;
  } catch (error) {
    console.error("Error checking address:", error);
    throw new Error("Database query failed");  // You can throw a more specific error
  }
};

export default findAddressId;

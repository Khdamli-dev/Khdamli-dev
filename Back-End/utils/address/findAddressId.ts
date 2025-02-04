import pool from "../../database/dbConnection";
import address from "../../interface/address";

const findAddressId = async ({ region, city, street, addressNumber }: address): Promise<number> => {
    const {rows : result} = await pool.query(`
      SELECT id FROM address WHERE 
      region = $1 
      AND (city = $2 OR city IS NULL) 
      AND (street = $3 OR street IS NULL)
      AND (address_number = $4 OR address_number IS NULL)
    `, [region, city, street, addressNumber]);
    // If no rows are returned, return 0
    if (result.length === 0) {
      return 0;
    }
    // If rows are returned, return the id of the existing address
    return result[0].id;
};

export default findAddressId;

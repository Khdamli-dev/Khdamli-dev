import pool from "../../database/dbConnection";
import address from "../../interface/address";

const checkAddress = async ({region , city , street , addressNumber}:address) : Promise<number>  =>{
try {
  const result = await pool.query(`
    SELECT 1 FROM address WHERE 
    region = $1 
    AND city= $2 
    AND street = $3 
    AND address_number = $4`
    ,[region , city , street , addressNumber])
    if (result.rows.length > 0) 
        return result.rows[0].id;// Return the address ID if it exists
        return 0;
    }
      catch (err) {
        console.error("Error checking address:", err);
        return 0;
      }

};
export default checkAddress;


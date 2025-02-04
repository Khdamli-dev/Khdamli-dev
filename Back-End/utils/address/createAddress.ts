import pool from "../../database/dbConnection";
import address from '../../interface/address';

const createAddress = async ({ region , city , street , addressNumber }: address): Promise<number> => {
    const {rows : result} = await pool.query(`
        INSERT INTO address ( region , city , street, address_number)
        VALUES ($1, $2, $3 , $4 ) RETURNING "id"`,
        [ region , city , street , addressNumber ],
    );
    return result[0].id;
};
export default createAddress;

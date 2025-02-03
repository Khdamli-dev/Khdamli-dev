import pool from "../../database/dbConnection";
import address from '../../interface/address';
const createAddress = async ({ region , city , street , addressNumber }: address) => {
    try {
        const result = await pool.query(`
            INSERT INTO address ( region , city , street, adress_number)
            VALUES ($1, $2, $3 , $4 ) RETURNING "id"`,
            [ region , city , street , addressNumber ],
        );
        return result.rows[0].id;
    } catch (error) {
        console.error('Error creating address:', error);
        throw new Error('Failed to create address');
    }
};
export default createAddress;

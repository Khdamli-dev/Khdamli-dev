import pool from "../../database/dbConnection";

const checkPhoneNumber = async (phoneNumber : number): Promise<boolean> => {
    const {rows : existPhoneNumber} = await pool.query(`
        SELECT id from "user"
        where phone_number=$1
        `,[phoneNumber]);
    return !existPhoneNumber.length;
}

export default checkPhoneNumber;
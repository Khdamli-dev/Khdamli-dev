import confirmationEmail from "../../controller/signupController/confirmationEmail";
import pool from "../../database/dbConnection";

// store updated email and send confirmation email to it
const updateEmail = async (userId : number, email : string) => {
    // store updated email if user don 't have one, else update it
    await pool.query(`
        INSERT INTO updated_email(user_id, email)
        values ($1, $2)
        ON CONFLICT (user_id) DO UPDATE
        SET email = EXCLUDED.email
        `, [userId, email]);
    // send confirmation email
    await confirmationEmail(userId, email);
}

export default updateEmail;
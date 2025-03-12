import pool from "../../database/dbConnection";

const getParentCategory = async (childCategory : number) : Promise<string> => {
    try {
        const {rows : result} = await pool.query(`
            SELECT e2.name AS name
            FROM category e1
            LEFT JOIN category e2
            ON e1.parent_category = e2.id
            WHERE e1.id = $1
            `, [childCategory]);
        return result[0].name;
    } catch (error) {
        console.log("error in getParentCategory : ", error);
        return '';
    }
}

export default getParentCategory;
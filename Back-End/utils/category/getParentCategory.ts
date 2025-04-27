import pool from "../../database/dbConnection";

const getParentCategory = async (childCategory : number) : Promise<string> => {
    try {
        const {rows : result} = await pool.query(`
            SELECT e2.name AS parent_name, e1.name AS child_name
            FROM category e1
            LEFT JOIN category e2
            ON e1.parent_category = e2.id
            WHERE e1.id = $1
            `, [childCategory]);
        // there is the case where category don't have parent
        return result[0].parent_name || result[0].child_name;
    } catch (error) {
        console.log("error in getParentCategory : ", error);
        return '';
    }
}

export default getParentCategory;
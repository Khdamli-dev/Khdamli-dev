import pool from "../../database/dbConnection";

const getWorkerParentCategories = async (workerId : number) : Promise<string[]> => {
    try {
        const {rows : result} = await pool.query(`
            SELECT DISTINCT parent.name
            FROM category child
            JOIN category parent ON child.parent_category = parent.id
            JOIN worker_category wc ON wc.category = child.id
            WHERE wc.worker = $1;
            `, [workerId]);
        // there is the case where category don't have parent
        return result;
    } catch (error) {
        console.log("error in getParentCategory : ", error);
        return [];
    }
}

export default getWorkerParentCategories;
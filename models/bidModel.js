import db from "../connection.js";

export async function fetchBidsByJobId(jobId) {
    //1. Verify the job exists
    const jobCheck = await db.query(
        `SELECT 1 FROM jobs WHERE job_id = $1`,
        [jobId]);
    if(!jobCheck.rows.length) throw Object.assign(new Error("Job not found"), {status:404});
    
    //fetch bids + provider info
    const { rows } = await db.query (`
    SELECT b.bid_id, b.provider_id, b.amount,
    b.status, u.firstname AS pr_firstname, u.lastname AS pr_lastname,
    u.avatar_url, b.created_at
    FROM bids b
    INNER JOIN users u ON b.provider_id = u.user_id
    WHERE b.job_id = $1
    ORDER BY b.created_at ASC;`, [jobId]);
    // 3. Parse amounts to numbers
    return rows.map(bid => ({
        ...bid, amount: parseFloat(bid.amount)
    }));
}
export async function insertBid({ job_id, amount, provider_id }) {
    if(!job_id || !amount || !provider_id) {
        throw Object.assign(new Error("Missing parameters"), {status:400});
    }
    const { rows } = await db.query(`
        INSERT INTO bids(job_id, amount, provider_id)
        VALUES ($1, $2, $3) RETURNING *;`, [job_id, amount, provider_id]);
        const bid = rows[0];
        bid.amount = parseFloat(bid.amount);
        return bid;
}

export async function updateBidStatus(bid_id, status) {
    const { rows } = await db.query(`
        UPDATE bids SET status = $2 WHERE bid_id = $1 RETURNING *;`, 
    [bid_id, status]);
    if(!rows.length) throw Object.assign(new Error("bid not found"), {status:404});
    return rows[0]
};
//module.exports = { fetchBidsByJobId };
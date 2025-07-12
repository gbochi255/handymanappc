const db = require("../connection.cjs");

async function fetchBidsByJobId(jobId) {
    //1. Verify the job exists
    const jobCheck = await db.query(
        `SELECT 1 FROM jobs WHERE job_id = $1`,
        [jobId]
    );
    if(!jobCheck.rows.length) {
        const err = new Error("Job not found");
        err.status = 404;
        throw err;
    }
    //fetch bids + provider info
    const sql = `
    b.bid_id,
    b.provider_id,
    b.amount,
    b.status,
    u.firstname AS pr_firstname,
    u.lastname AS pr_lastname,
    u.avatar_url,
    b.created_at
    FROM bids b
    INNER JOIN users u
    ON b.provider_id = u.user_id
    WHERE b.job_id = $1
    ORDER BY b.created_at ASC;
    `;
    const { rows } = await db.query(sql, [jobId]);
    // 3. Parse amounts to numbers
    return rows.map(bid => ({
        ...bid,
        amount: parseFloat(bid.amount)
    }));
}
module.exports = { fetchBidsByJobId };
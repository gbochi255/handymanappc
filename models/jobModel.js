import db from '../connection.js';
import { checkUserExists } from '../utils/validation.js';
/**
 * fetch all jobs, optionally filtering by creator and/or status.
 * param {{ created_by?: number, status?: string }} option
 * returns {promise<Array>}
 */
export async function fetchJobs({ created_by = null, status = null } = {}) {
    const sql = `
    SELECT *
    FROM jobs j
    WHERE ($1::jobs_status IS NULL OR j.created_by = $2)
    ORDER BY j.date_posted DESC;
    `;
    const params = [status, created_by];
    const { rows } = await db.query(sql, params);
    return rows;
}

/**
 * fetch a client's jobs, with bid counts and lowest bid amount
 * param {{ client_id?: number, status?: string }} options
 * returns {Promise<Array>}
 */

export async function fetchClientJobs({ client_id = null, status = null } = {}) {
    if (client_id !== null) await checkUserExists(client_id);

    let sql = `
    SELECT J.*,
    COUNT(b.bid_id) AS bid_count,
    MIN(b.amount) AS best_bid
    FROM jobs j
    LEFT JOIN bids b ON j.job_id = b.job_id
    `;
    const conditions = [];
    const params = [];

    if (client_id !== null) {
        params.push(client_id);
        conditions.push(`j.created_by = $${params.length}`);
    }
    if(status !== null) {
        params.push(status);
        conditions.push(`j.status = $${params.length}`);
    }
    if (conditions.length) {
        sql +=  `WHERE  ${conditions.join(" AND ")}`;
    }
    sql += `
    GROUP BY j.job_id
    ORDER BY j.date_posted DESC;
    `;
    const { rows }   = await db.query(sql, params);
    return rows;
}

/**
 * Fetch jobs near a provider, within a given distances(miles), optional status filter.
 * params{ provided_id: number, distanceMiles?: number, status?: string } options
 * returns {Promise<Array>}
 */

export async function fetchProviderJobs({ provider_id, distanceMiles = 10, status = null }) {
    await checkUserExists(provider_id, true);
    const meters = distanceMiles * 1609.34;

    let sql = `
    SELECT j.*,
    ROUND(ST_Distance(
    u.location::geography,
    j.location::geography) /1609.34, 3)
    :: double precision AS distance
    FROM jobs j
    JOIN users u ON u.user_id = $1`;

    const conditions = [ `ST_DWithin(u.location::geography, j.location::geography, $2)` ];
    const params = [provider_id, meters];

    if(status !== null) {
        params.push(status);
        conditions.push(`j.status = $${params.length}`);
    }
    sql += `WHERE ${conditions.join(" AND ")} ORDER BY ST_Distance(
    u.location::geography,
    j.location::geography) ASC;
    `;
    const { rows } = await db.query(sql, params);
    return rows;
}

/**
 * Internal helper: fetch provider's jobs joined to their bids, with custom select and where.
 */

export async function _fetchProviderJobsWithBids(provider_id, additionalSelect, whereClause) {
    await checkUserExists(provider_id, true);

    const sql = `
    SELECT j.*,
    ROUND(
    ST_Distance(
    u.location::geography,
    j.location::geography) / 1609.34, 3
    )::double precision AS distance ${additionalSelect}
    FROM JOBS j
    JOIN bids b ON j.job_id = b.job_id
    JOIN users u ON u.user_id = $1
    WHERE b.provider_id = $1
    ${whereClause}
    ORDER BY j.date_posted DESC;
    `;

    const { rows } = await db.query(sql, [provider_id]);
    return rows;
}

export async function fetchProviderBids(provided_id) {
    const additionalSelect = `,
    CASE
    WHEN j.status = 'open' THEN 'Waiting'
    WHEN j.status IN ('accepted', 'completed') AND j.accepted_bid !== b.bid_id THEN 'Lost'
    ELSE 'Unknown'
    END AS bid_status
    `;
    const whereClause = `
    AND ( 
    j.status = 'open'
    OR (j.status IN ('accepted', 'completed') AND j.accepted_bid != b.bid_id))
    `;
    return _fetchProviderJobsWithBids(provided_id, additionalSelect, whereClause);
}

export async function fetchProviderWonJobs(provider_id) {
    const additionalSelect = `,
    CASE
    WHEN j.status = 'accepted' THEN 'Pending'
    WHEN j.status = 'completed' THEN 'Done'
    ELSE 'Unknown'
    END AS job_progress`;
    
    const whereClause = `
    AND j.status IN ('accepted', 'completed')
    AND j.accepted_bid = b.bid_id `;
    return _fetchProviderJobsWithBids(provider_id, additionalSelect, whereClause);
}

/**
 * Create a new job, using the creator's current location
 */

export async function postJob({ summary, job_detail, category, created_by, photo_url, target_date }) {
    const sql = `
    INSERT INTO jobs (summary, job_detail, category, created_by, photo_url, target_date, location)
    SELECT $1, $2, $3, $4, $5, $6, u.location
    FROM users u
    WHERE u.user_id = $4
    RETURNING *;
    `;
    const params = [summary, job_detail, category, created_by, photo_url, target_date];
    const { rows } = await db.query(sql, params);
    if(!rows.length) {
        const err = new Error("user not found or no location set");
        err.status = 404;
        throw err;
    }
        return rows[0];
}

/**
 * Accept one bid (rejection for all others) in a single transaction.
 */

export async function updateBidAccept(job_id, bid_id) {
    try{
        await db.query("BEGIN");
        const bidSql = `
        UPDATE bids
        SET status = CASE
        WHEN bid_id = $2 THEN 'accepted'::bid_status
        END
        WHERE job_id = $1
        RETURNING *;
        `;
        const { rows: bidRows } =await db.query(bidSql, [job_id, bid_id]);
        if (!bidRows.some(r => r.bid_id === bid_id)) {
            throw Object.assign(new Error("Bid not found"), { status: 404 });
        }
        await db.query("COMMIT");
        return bidRows;

        }catch (err) {
            await db.query("ROLLBACK");
            throw err;
        }
}
/**
 * fetch a single job by its ID
 */

export async function fetchJobByID(job_id) {
    const sql = `
    SELECT *, ST_AsText(location) AS location_wkt
    FROM jobs
    WHERE job_id = $1;
    `;
    const { rows } = await db.query(sql, [job_id]);
    if (!rows.length) {
        const err = new Error("job not found");
        err.status = 404;
        throw err;
    }
    return rows[0];
}

/**
 * place a new bid on a job
 */

export async function insertBid({ job_id, amount, provider_id }) {
    if (!job_id || !amount || !provider_id) {
        const err = new Error("Missing required parameters");
        err.status = 400;
        throw err;
    }
    const sql = `
    INSERT INTO bids(job_id, amount, provider_id)
    VALUES ($1, $2, $3)
    RETURNING *;
    `;
    const { rows } = await db.query(sql, [job_id, amount, provider_id]);
    rows[0].amount = parseFloat(rows[0].amount);
    return rows[0];
}
/**
 * mark a job completed
 */
export async function upDateJobComplete(job_id) {
    const sql = `
    UPDATE jobs
    SET status = 'completed', completion_date =CURRENT_TIMESTAMP
    WHERE job_id = $1
    RETURNING *;
    `;
    const { rows } = await db.query(sql, [job_id]);
    if(!rows.length) {
        const err = new Error("Job not found");
        err.status = 404;
        throw err;
    }
    return rows[0];
}

//module.exports = { fetchJobs, fetchClientJobs, fetchProviderJobs, fetchProviderBids,
  //  fetchProviderWonJobs, postJob, upDateJobComplete, updateBidAccept, fetchJobByID, insertBid
//};
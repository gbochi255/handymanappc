
import { fetchBidsByJobId, insertBid, updateBidStatus as modelUpdateBidStatus } from "../models/bidModel.js";
/**
 * GET /api/bids/job/:job_id
 */

export async function getBidsByJob(req, res, next) {
    try {
        const job_id = Number(req.params.job_id);
        const bids = await fetchBidsByJobId(job_id);
        res.json({ bids });
    }catch(err) {
        next(err);
    }
};

/**
 * POST /api/bids/job/:job_id
 */

export async function createBid(req, res, next) {
    try {
        const job_id = Number(req.params.job_id);
        const { amount, provider_id } = req.body;
        const bid = await insertBid({ job_id, amount, provider_id });
        res.status(201).json(bid);
    }catch(err) {
        next(err);
    }
};

/**
 * PATCH /api/bids/:bid_id/status
 * body: { status: 'accepted' | 'rejected'  | 'pending' }
 */

export async function updateBidStatus(req, res, next) {
    try{
    const bid_id = Number(req.params.bid_id);
    const { status } = req.body;
    const updatedBid = await modelUpdateBidStatus(bid_id, status); 
    res.json(updatedBid);
}catch(err) {
    next(err);
}
};
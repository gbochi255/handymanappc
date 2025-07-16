//const jobModel = require("../models/jobModel");
import * as jobModel from "../models/jobModel.js";

export async function getJobs(req, res, next) {
    try {
    const { created_by, status }   = req.query;
    // convert created_by to number if present
    const jobs = await jobModel.fetchJobs({
        created_by: created_by ? Number(created_by) : null,
        status: status || null
    });
    res.json({ jobs });
    }catch(err) {
        next(err);
}
}
export async function getClientJobs(req, res, next) {
    try {
        const { client_id, status } = req.query;
        const jobs = await jobModel.fetchClientJobs({
            client_id: client_id ? Number(client_id) : null,
            status: status || null
        });
        res.json({ jobs });
    }catch(err) {
        next(err);
    }
};

export async function getProviderJobs(req, res, next) {
    try {
        //const { distance, status} = req.query;
        const distance = req.query.distance ? Number(req.query.distance) : 10;
        const status = req.query.status || null;
        const provider_id = Number(req.params.provider_id);
        /*if(!provider_id) {
            return next(Object.assign(new Error("provider_id is required"), { status: 400 }));
        }
        let distanceMiles =10;
        if (distance) {
            distanceMiles = parseFloat(distance);
            if(isNaN(distanceMiles) || distanceMiles <= 0) {
                return next(Object.assign(new Error("Distance must be a positive number"), { status: 400 }));
            }
        }*/
        const jobs = await jobModel.fetchProviderJobs({
            provider_id,
            distanceMiles: distance, status });
        res.json({ jobs });
    }catch(err) {
        next(err);
    }
};

export async function getProviderBids(req, res, next) {
    try {
        const provider_id = Number(req.params.provider_id);
        const bids = await jobModel.fetchProviderBids(provider_id);
        res.json({ bids });
    }catch(err) {
        next(err);
    }
};

export async function getProviderWonJobs(req, res, next) {
    try {
        const provider_id = Number(req.params.provider_id);
        const jobs = await jobModel.fetchProviderWonJobs(provider_id);
        res.json([ jobs ]);
    }catch(err) {
        next(err)
    }
};

export async function createJob(req, res, next) {
    try {
        const { summary, job_detail, category, created_by, photo_url, target_date } = req.body;
        if(!summary || !job_detail || !created_by || !photo_url) {
            throw Object.assign(new Error("Missing required body parameters"), { status:400 });
        }
        const job = await jobModel.postJob({
            summary, job_detail, category, created_by, photo_url,
            target_date: target_date || null
        });
        res.json(job)
    }catch(err) {
        next(err)
    }
};

export async function patchJobComplete(req, res, next) {
    try {
        const job_id = Number(req.params.job_id);
        const job = await jobModel.upDateJobComplete(Number(req.params.job_id));
        res.json(job);
    }catch(err) {
        next(err);
    }
};

export async function patchBidAccept(req, res, next) {
    try {
        const job_id = Number(req.params.job_id);
        const bid_id = Number(req.params.bid_id);
        const bids = await jobModel.updateBidAccept(job_id, bid_id);
        res.json({ bids });
    }catch(err) {
        next(err);
    }
};

export async function getJobByID(req, res, next) {
    try {
        const job_id = Number(req.params.job_id);
        const job = await jobModel.fetchJobByID(job_id)
        res.json(job);
    }catch(err) {
        next(err)
    }
};

export async function postBid(req, res, next) {
    try {
        const job_id = Number (req.params.job_id);
        const { amount, provider_id } = req.body;
        const bid = await jobModel.insertBid({ job_id, amount, provider_id });
        res.json(bid);
    }catch(err) {
        next(err);
    }
};
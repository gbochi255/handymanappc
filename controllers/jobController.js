const jobModel = require("../models/jobModel");

exports.getJobs = async (req, res, next) => {
    try {
        const { created_by, status }   = req.query;
        // convert created_by to number if present
        const jobs = await jobModel.fetchJobs({
            created_by: created_by ? Number(created_by) : null,
            status: status || null
        });
        res.status(200).json({ jobs });
        }catch(err) {
            next(err);
    }
};

exports.getClientJobs = async (req, res, next) => {
    try {
        const { client_id, status } = req.query;
        const jobs = await jobModel.fetchClientJobs({
            client_id: client_id ? Number(client_id) : null,
            status: status || null
        });
        res.status(200).json({ jobs });
    }catch(err) {
        next(err);
    }
};

exports.getProviderJobs = async (req, res, next) => {
    try {
        const { distance, status} = req.query;
        const provider_id = Number(req.params.provider_id);
        if(!provider_id) {
            return next(Object.assign(new Error("provider_id is required"), { status: 400 }));
        }
        let distanceMiles =10;
        if (distance) {
            distanceMiles = parseFloat(distance);
            if(isNaN(distanceMiles) || distanceMiles <= 0) {
                return next(Object.assign(new Error("Distance must be a positive number"), { status: 400 }));
            }
        }
        const jobs = await jobModel.fetchProviderJobs({
            provider_id,
            distanceMiles,
            status: status || null
        });
        res.status(200).json({ jobs });
    }catch(err) {
        next(err);
    }
};

exports.getProviderBids = async (req, res, next) => {
    try {
        const provider_id = Number(req.params.provider_id);
        const jobs = await jobModel.fetchProviderBids(provider_id);
        res.status(200).json({ jobs });
    }catch(err) {
        next(err);
    }
};

exports.getProviderWonJobs = async (req, res, next) => {
    try {
        const provider_id = Number(req.params.provider_id);
        const jobs = await jobModel.fetchProviderWonJobs(provider_id);
        res.status(200).json([ jobs ]);

    }catch(err) {
        next(err)
    }
};

exports.createJob = async (req, res, next) => {
    try {
        const { summary, job_detail, category, created_by, photo_url, target_date } = req.body;
        if(!summary || !job_detail || !created_by || !photo_url) {
            throw Object.assign(new Error("Missing required body parameters"), { status:400 });
        }
        const job = await jobModel.postJob({
            summary, job_detail, category, created_by, photo_url,
            target_date: target_date || null
        });
        res.status(201).json(job)
    }catch(err) {
        next(err)
    }
};

exports.patchJobComplete = async (req, res, next) => {
    try {
        const job_id = Number(req.params.job_id);
        const job = await jobModel.upDateJobComplete(job_id);
        res.status(200).json(job);
    }catch(err) {
        next(err);
    }
};

exports.patchBidAccept = async(req, res, next) => {
    try {
        const job_id = Number(req.params.job_id);
        const bid_id = Number(req.params.bid_id);
        const bids = await jobModel.updateBidAccept(job_id, bid_id);
        res.status(200).json({ bids });
    }catch(err) {
        next(err);
    }
};

exports.getJobByID = async (req, res, next) => {
    try {
        const job_id = Number(req.params.job_id);
        const job = await jobModel.fetchJobByID(job_id)
        res.status(200).json(job);
    }catch(err) {
        next(err)
    }
};

exports.postBid = async(res, res, next) => {
    try {
        const job_id = Number (req.params.job_id);
        const { amount, provider_id } = req.body;
        const bid = await jobModel.insertBid({ job_id, amount, provider_id });
        res.status(201).json(bid);
    }catch(err) {
        next(err);
    }
};
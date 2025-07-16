
import { Router } from "express";
//import { createRequire } from "module";
//const requireCJS = createRequire(import.meta.url);
//console.log("Router is loaded from:", requireCJS.resolve("express/lib/router/index.js"));
//console.log("Router is from:", require.resolve("express/lib/router/index.js"));
import { 
    getBidsByJob, 
    createBid, 
    updateBidStatus 
} from "../controllers/bidController.js";

const router = Router();

router.get("/job/:job_id", getBidsByJob);
router.post("/job/:job_id", createBid);
router.patch("/:bid_id/status", updateBidStatus);

export default router;
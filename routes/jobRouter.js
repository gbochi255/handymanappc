
import { Router } from "express";
//import { createRequire } from "module";
//const requireCJS = createRequire(import.meta.url);
//console.log("Router is loaded from:", requireCJS.resolve("express/lib/router/index.js"));
//console.log("Router is from:", require.resolve("express/lib/router/index.js"));
import * as jobCtrl from "../controllers/jobController.js";
const router = Router();

router.get("/client", jobCtrl.getClientJobs);
router.get("/provider/:provider_id", jobCtrl.getProviderJobs);
router.get("/provider/:provider_id/bids", jobCtrl.getProviderBids);
router.get("/provider/:provider_id/won", jobCtrl.getProviderWonJobs);

router.get("/", jobCtrl.getJobs);
router.post("/", jobCtrl.createJob);

router.get("/:job_id", jobCtrl.getJobByID);
router.patch("/:job_id/complete", jobCtrl.patchJobComplete);
router.patch("/:job_id/accept/:bid_id", jobCtrl.patchBidAccept);

export default router;

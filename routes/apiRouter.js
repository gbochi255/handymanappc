
import { Router } from "express";
//import { createRequire } from "module";
//const requireCJS = createRequire(import.meta.url);
//console.log("Router is loaded from:", requireCJS.resolve("express/lib/router/index.js"));
//console.log("Router is from:", require.resolve("express/lib/router/index.js"));
import userRouter from "./userRouter.js";
import jobRouter from "./jobRouter.js";
import bidRouter from "./bidRouter.js"

const apiRouter = Router();
//mount in logical order

apiRouter.use("/users", userRouter);
apiRouter.use("/jobs", jobRouter);
apiRouter.use("/bids", bidRouter);

export default apiRouter;
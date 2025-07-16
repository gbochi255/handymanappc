import { Router } from "express";
//import { createRequire } from "module";
//const requireCJS = createRequire(import.meta.url);
//console.log("Router is loaded from:", requireCJS.resolve("express/lib/router/index.js"));
//console.log("Router is from:", require.resolve("express/lib/router/index.js"));
import { register, login, getProfile, 
    patchProfile, deleteProfile } from "../controllers/userController.js";
import { 
    validateRegistration, 
    validateLogin 
} from "../utils/validation.js";

const router = Router();

//auth
router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);

//profile
router.get("/:id", getProfile);
router.patch("/:id", patchProfile);
router.delete("/:id", deleteProfile);

export default router;
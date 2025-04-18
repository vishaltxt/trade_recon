import express from "express";
import { register, login, recon } from "../controllers/auth-controller.js";
export const router = express.Router();
import { signupSchema } from "../Validators/auth-validator.js";
import { validate } from "../middlewares/validate-middleware.js";

router.post("/register", validate(signupSchema), register);
router.post("/login",validate() ,login);
router.get("/recon", recon);

// export default router;

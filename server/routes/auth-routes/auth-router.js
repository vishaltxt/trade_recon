import express from "express";
import { register, login, recon ,read, logout} from "../../controllers/authControllers/auth-controller.js";
export const router = express.Router();
import { signupSchema } from "../../Validators/auth-validator.js";
import { validate } from "../../middlewares/validate-middleware.js";

router.post("/register", validate(signupSchema), register);
router.post("/login" ,login);
router.get("/logout",logout)
router.get("/recon", recon);


router.get('/master',read)
// export default router;

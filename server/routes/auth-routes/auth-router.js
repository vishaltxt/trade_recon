import express from "express";
import { register, login, recon ,read, logout} from "../../controllers/authControllers/auth-controller.js";
import { signupSchema } from "../../Validators/auth-validator.js";
import { validate } from "../../middlewares/validate-middleware.js";

export const authRouter = express.Router();

authRouter.post("/register", validate(signupSchema), register);
authRouter.post("/login" ,login);
authRouter.get("/logout",logout)
authRouter.get("/recon", recon);


authRouter.get('/master',read)
// export default router;

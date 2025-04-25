import express from "express";
import { register, login, recon ,read, logout} from "../../controllers/authControllers/auth-controller.js";
export const userRouter = express.Router();
import { signupSchema } from "../../Validators/auth-validator.js";
import { validate } from "../../middlewares/validate-middleware.js";

userRouter.post("/register", validate(signupSchema), register);
userRouter.post("/login" ,login);
userRouter.get("/logout",logout)
userRouter.get("/recon", recon);


userRouter.get('/master',read)
// export default router;

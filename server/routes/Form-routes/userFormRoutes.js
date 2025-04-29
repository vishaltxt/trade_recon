import express from "express";
import {createUser, getAllUsers, updateUser, deleteUser} from "../../controllers/userFormControllers/userForm-controller.js";
import { formSchema } from "../../Validators/form-validator.js";
import { validate } from "../../middlewares/validate-middleware.js";
import { adminOnly, protect } from "../../middlewares/form-middleware.js";

export const addUserRouter = express.Router();

//userform routes
addUserRouter.post("/add-user", protect, adminOnly,validate(formSchema), createUser);
addUserRouter.get("/users", protect, adminOnly, getAllUsers);
addUserRouter.put("/update-user/:id", protect, adminOnly, updateUser);
addUserRouter.delete("/delete-user/:id", protect, adminOnly, deleteUser);

// userFormRouter.post('/users', validate(formSchema),createUser);
// userFormRouter.get('/users', getAllUsers);
// userFormRouter.put('/users/:id', updateUser);
// userFormRouter.delete('/users/:id', deleteUser);    

//master form routes
// formRouter.post('/masters',createMaster);
// formRouter.get('/masters', getMasters);
// formRouter.put('/masters/:id',updateMaster);
// formRouter.delete('/masters/:id',deleteMaster);

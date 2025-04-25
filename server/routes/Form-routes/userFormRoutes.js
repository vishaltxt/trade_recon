import express from "express";
import {createUser, getUsers, updateUser, deleteUser} from "../../controllers/userFormControllers/userForm-controller.js";
import { formSchema } from "../../Validators/form-validator.js";
import { validate } from "../../middlewares/validate-middleware.js";
export const userFormRouter = express.Router();

//userform routes
userFormRouter.post('/users', validate(formSchema),createUser);
userFormRouter.get('/users', getUsers);
userFormRouter.put('/users/:id', updateUser);
userFormRouter.delete('/users/:id', deleteUser);    

//master form routes
// formRouter.post('/masters',createMaster);
// formRouter.get('/masters', getMasters);
// formRouter.put('/masters/:id',updateMaster);
// formRouter.delete('/masters/:id',deleteMaster);

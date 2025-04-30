import express from "express";
import { createMasters, deleteMasters, getMasters, updateMasters } from "../../controllers/userFormControllers/masterForm-controller.js";
export const masterFormRouter = express.Router();

// master form routes
masterFormRouter.post('/add-masters',createMasters);
masterFormRouter.get('/masters', getMasters);
masterFormRouter.put('/update-masters/:id',updateMasters);
masterFormRouter.delete('/delete-masters/:id',deleteMasters);

import express from "express";
import { createMasters, deleteMasters, getMasters, updateMasters } from "../../controllers/userFormControllers/masterForm-controller.js";
export const masterFormRouter = express.Router();

// master form routes
masterFormRouter.post('/masters',createMasters);
masterFormRouter.get('/masters', getMasters);
masterFormRouter.put('/masters/:id',updateMasters);
masterFormRouter.delete('/masters/:id',deleteMasters);

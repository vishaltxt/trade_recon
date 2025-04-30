import express from "express";
import { createMinions, deleteMinions, getMinions, updateMinions } from "../../controllers/userFormControllers/minionForm-controller.js";
export const minionFormRouter = express.Router();

// master form routes
minionFormRouter.post('/add-minions',createMinions);
minionFormRouter.get('/minions', getMinions);
minionFormRouter.put('/update-minions/:id',updateMinions);
minionFormRouter.delete('/delete-minions/:id',deleteMinions);

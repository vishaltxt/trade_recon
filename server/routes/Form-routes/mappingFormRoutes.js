import express from "express";
import { createMappings, deleteMappings, getMappings, updateMappings } from "../../controllers/userFormControllers/mappingForm-controller.js";
export const mappingFormRouter = express.Router();

// mappings routes
mappingFormRouter.post('/add-mappings',createMappings);
mappingFormRouter.get('/mappings', getMappings);
mappingFormRouter.put('/update-mappings/:id',updateMappings);
mappingFormRouter.delete('/delete-mappings/:id',deleteMappings);

import express from "express";
import userController from '../../controllers/userFormControllers/userForm-controller.js';

const router = express.Router();

router.post('/users', userController.createUser);
router.get('/users', userController.getUsers);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

module.exports = router;

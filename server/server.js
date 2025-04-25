import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { userRouter } from "./routes/auth-routes/auth-router.js";
import {userFormRouter } from "./routes/Form-routes/userFormRoutes.js";
import { masterFormRouter } from "./routes/Form-routes/masterFormRoutes.js";
const app = express();
import { connectDb } from "./utils/db.js";
import { errorMiddleware } from "./middlewares/error-middleware.js";
import cors from 'cors';

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH","HEAD"],
  credentials: true,
};
app.use(cors(corsOptions));


app.use(express.json());
app.use("/api/auth", userRouter);
app.use("/api/data",userRouter);
app.use("/api/form",userFormRouter,masterFormRouter);
// app.use("/api/form",masterFormRouter);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`server is listening on port: ${PORT}`);
  });
});

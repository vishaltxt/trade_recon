import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { authRouter } from "./routes/auth-routes/auth-router.js";
import {addUserRouter } from "./routes/Form-routes/userFormRoutes.js";
import { masterFormRouter } from "./routes/Form-routes/masterFormRoutes.js";
import { minionFormRouter } from "./routes/Form-routes/minionFormRoutes.js";
import { mappingFormRouter } from "./routes/Form-routes/mappingFormRoutes.js";
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
app.use("/api/auth", authRouter); // Authentication routes
app.use("/api/users", addUserRouter);  // User form routes
// app.use("/api/data",addUserRouter);
app.use("/api/master",masterFormRouter) // Master form routes;
app.use("/api/minion",minionFormRouter) // Minion form routes;
app.use("/api/mapping",mappingFormRouter) // Mapping form routes;
// app.use("/api/form",masterFormRouter);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`server is listening on port: ${PORT}`);
  });
});

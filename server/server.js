import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { router } from "./routes/auth-router.js";
const app = express();
import { connectDb } from "./utils/db.js";
import { errorMiddleware } from "./middlewares/error-middleware.js";
import cors from 'cors';

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    // origin: 'http://localhost:5173',
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);


app.use(express.json());
app.use("/api/auth", router);
app.use("/api/data",router);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`server is listening on port: ${PORT}`);
  });
});

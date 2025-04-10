import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import corsOptions from "./config/cors";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import workspacesRoutes from "./routes/workspacesRoutes";
import cookieParser from "cookie-parser";

dotenv.config();

const PORT: number = parseInt(process.env.PORT as string, 10) || 8080;

const app: Express = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/workspaces", workspacesRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

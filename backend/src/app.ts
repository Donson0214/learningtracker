import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { rateLimiter } from "./middlewares/rateLimiter";

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  rateLimiter({
    skip: (req) => req.path === "/api/health",
  })
);

app.use("/api", routes);
app.use(errorHandler);

export default app;

import express from "express";
import morgan from "morgan";
import loanRoutes from "./api/v1/routes/loanRoutes";

const app = express();

app.use(express.json());
app.use(morgan("combined"));

// health
app.get("/health", (_req, res) => res.status(200).send("Server is healthy"));

// API
app.use("/api/v1/loans", loanRoutes);

// error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: any) => {
  console.error(err);
  const status = err?.status || 500;
  res.status(status).json({ error: err?.message ?? "Internal server error" });
});

export default app;

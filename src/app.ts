import express from "express";
import morgan from "morgan";
import loanRoutes from "./api/v1/routes/loanRoutes";
import { Server } from "http";

const PORT = parseInt(process.env.PORT as string) || 3000;
const app = express();

app.use(express.json());
app.use(morgan("combined"));

app.get("/health", (_req, res) => res.status(200).send("Server is healthy"));

app.use("/api/v1/loans", loanRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: any) => {
  console.error(err);
  const status = err?.status || 500;
  res.status(status).json({ error: err?.message ?? "Internal server error" });
});

const server: Server = app.listen(PORT, '0.0.0.0', 0, () => {
    console.log(`Server is running on port ${PORT}`);
});

export  {app, server};

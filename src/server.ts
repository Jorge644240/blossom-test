import express from "express";
import cors from "cors";
import { createHttpController } from "./interfaces/HttpController.js";
import { ExternalApiAdapter } from "./adapters/apis.adapter.js";
import { RequestLogsAdapter } from "./adapters/logs.adapter.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const apiAdapter = new ExternalApiAdapter(Number(process.env.MAX_API_RETRIES) || 3, new RequestLogsAdapter);

app.use("/api", createHttpController(apiAdapter));

app.listen(port)
.on("listening", () => console.log(`App running on port ${port}`));
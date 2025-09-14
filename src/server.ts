import express from "express";
import { createHttpController } from "./interfaces/HttpController.js";

const app = express();

app.use("/api", createHttpController());

app.listen(3000);
import cors from "cors";
import express from "express";
import { createServer } from "http";

const app = express();
app.use(cors());

export const httpServer = createServer(app);

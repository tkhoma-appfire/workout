// Vercel requires the entrypoint to import express directly.
import express from "express";
import "./env.js";
import { getApp } from "./bootstrap.js";

const port = Number(process.env.PORT ?? 8081);
const app = await getApp();

export default app;

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`workout-be-node listening on http://localhost:${port}`);
  });
}

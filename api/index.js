// Vercel requires the serverless entrypoint to import express directly.
import express from "express";
import "../be-node/dist/env.js";
import { getApp } from "../be-node/dist/bootstrap.js";

export default getApp();

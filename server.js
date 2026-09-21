import express from "express";
import cors from "cors";
import Redis from "ioredis";
import { Connection, Client } from "@temporalio/client";
import axios from "axios";

import supplierBRouter from "./src/features/supplierB/supplierB.routes.js";
import supplierARouter from "./src/features/supplierA/supplierA.routes.js";

const server = express();
const PORT = process.env.PORT || 8080;

// Initialize Redis and Temporal structural connections
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
let temporalClient;

async function connectTemporal() {
    try {
        const connection = await Connection.connect({
            address: process.env.TEMPORAL_ADDRESS || 'localhost:7233'
        });
        temporalClient = new Client({ connection });
        console.log(" Connected to Temporal Server cluster successfully.");
    } catch (err) {
        console.error("Temporal Client initialization failed:", err.message);
    }
}

server.use(express.json());
server.use(cors());


server.use("/api/supplierA", supplierARouter);
server.use("/api/supplierB", supplierBRouter);


server.get("/api/hotels", async (req, res) => {
    const { city, minPrice, maxPrice } = req.query;

    if (!city) {
        return res.status(400).json({ success: false, error: "City parameter is required." });
    }

    try {
        const redisKey = `hotels:${city.toLowerCase()}`;

        // 1. Kick off deterministic background orchestrator workflow execution loop
        const handle = await temporalClient.workflow.start("hotelOrchestratorWorkflow", {
            args: [city],
            taskQueue: 'hotel-offers-queue',
            workflowId: `hotel-search-${city.toLowerCase()}-${Date.now()}`
        });

        
        await handle.result();

        
        const min = minPrice ? parseFloat(minPrice) : '-inf';
        const max = maxPrice ? parseFloat(maxPrice) : '+inf';

        const cachedEntries = await redis.zrangebyscore(redisKey, min, max);
        const results = cachedEntries.map(entry => JSON.parse(entry));

        return res.status(200).json(results);
    } catch (error) {
        console.error("Orchestration pipeline failure:", error);
        return res.status(500).json({ error: "Internal distributed workflow processing failure." });
    }
});


server.get("/health", async (req, res) => {
    const status = { redis: "DOWN", supplierA: "DOWN", supplierB: "DOWN" };
    try { await redis.ping(); status.redis = "UP"; } catch {}
    try { await axios.get(`http://localhost:${PORT}/api/supplierA/hotels`); status.supplierA = "UP"; } catch {}
    try { await axios.get(`http://localhost:${PORT}/api/supplierB/hotels`); status.supplierB = "UP"; } catch {}
    res.status(Object.values(status).includes("DOWN") ? 207 : 200).json(status);
});

server.get("/", (req, res) => {
    res.send("Welcome to hotels API!");
});

server.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectTemporal();
});

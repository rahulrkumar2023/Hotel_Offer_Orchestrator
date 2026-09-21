import Redis from "ioredis";
import { Connection, Client } from "@temporalio/client";

// Connect to Redis (uses local or Docker fallback)
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Maintain a single Temporal Client instance connection link
let temporalClient = null;

async function getTemporalClient() {
    if (!temporalClient) {
        const connection = await Connection.connect({
            address: process.env.TEMPORAL_ADDRESS || 'localhost:7233'
        });
        temporalClient = new Client({ connection });
    }
    return temporalClient;
}

export default class HotelController {

    
    async filterHotels(req, res) { 
        try {
            const { city, minPrice, maxPrice } = req.query;
            
            if (!city) {
                return res.status(400).json({ success: false, message: "City parameter is required." });
            }

           
            const client = await getTemporalClient();
            const handle = await client.workflow.start("hotelOrchestratorWorkflow", {
                args: [city],
                taskQueue: 'hotel-offers-queue',
                workflowId: `hotel-search-${city.toLowerCase()}-${Date.now()}`
            });

             
            await handle.result();

          
            const redisKey = `hotels:${city.toLowerCase()}`;
            const min = minPrice ? parseFloat(minPrice) : '-inf';
            const max = maxPrice ? parseFloat(maxPrice) : '+inf';

            
            const cachedList = await redis.zrangebyscore(redisKey, min, max);
            
            
            const result = cachedList.map(item => JSON.parse(item));

            return res.status(200).json(result);

        } catch (error) {
            console.error("Controller Orchestration Error:", error);
            return res.status(500).send("Something went wrong with the hotel orchestrator service!");
        }
    }
}

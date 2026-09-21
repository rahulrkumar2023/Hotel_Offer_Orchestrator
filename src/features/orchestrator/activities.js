import axios from 'axios';
import Redis from 'ioredis';


const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const PORT = process.env.PORT || 8080;

export async function fetchSupplierA(city) {
  try {
    const res = await axios.get(`http://localhost:${PORT}/api/supplierA/hotels`);
    
    return res.data.filter(h => h.city.toLowerCase() === city.toLowerCase());
  } catch (err) {
    console.error('Supplier A down:', err.message);
    return []; 
  }
}

export async function fetchSupplierB(city) {
  try {
    const res = await axios.get(`http://localhost:${PORT}/api/supplierB/hotels`);
    return res.data.filter(h => h.city.toLowerCase() === city.toLowerCase());
  } catch (err) {
    console.error('Supplier B down:', err.message);
    return [];
  }
}

export async function saveOffersToRedis(city, offers) {
  const key = `hotels:${city.toLowerCase()}`;
  
 
  await redis.del(key);

  if (offers.length === 0) return;

  
  const pipeline = redis.pipeline();
  for (const offer of offers) {
    pipeline.zadd(key, offer.price, JSON.stringify(offer));
  }
  await pipeline.exec();
}



import { proxyActivities } from '@temporalio/workflow';


const { fetchSupplierA, fetchSupplierB, saveOffersToRedis } = proxyActivities({
  startToCloseTimeout: '10 seconds'
});

export async function hotelOrchestratorWorkflow(city) {
 
  const [listA, listB] = await Promise.all([
    fetchSupplierA(city),
    fetchSupplierB(city)
  ]);

  const hotelMap = new Map();

 
  for (const hotel of listA) {
    hotelMap.set(hotel.name.toLowerCase(), {
      name: hotel.name,
      price: hotel.price,
      supplier: 'Supplier A',
      commissionPct: hotel.commissionPct
    });
  }

  
  for (const hotel of listB) {
    const key = hotel.name.toLowerCase();
    const existing = hotelMap.get(key);

    if (!existing || hotel.price < existing.price) {
      hotelMap.set(key, {
        name: hotel.name,
        price: hotel.price,
        supplier: 'Supplier B',
        commissionPct: hotel.commissionPct
      });
    }
  }

  const finalOffers = Array.from(hotelMap.values());

  // 4. Cache compiled data structure inside Redis
  await saveOffersToRedis(city, finalOffers);

  return finalOffers;
}

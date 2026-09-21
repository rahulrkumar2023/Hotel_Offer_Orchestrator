import hotelsData from "./hotels.data.js";

export const fiterHotels= (city , minPrice , maxPrice)=>{
    const result = hotelsData.filter((hotel)=>{
        return (
            (!city  || hotel.city.trim().toLowerCase() === city.trim().toLowerCase()) &&
            (!minPrice || hotel.price >= minPrice) &&
            (!maxPrice || hotel.price<=maxPrice)
        )
    });

    return result
} 


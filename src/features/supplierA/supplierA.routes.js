import express from "express";
import HotelController from "./hotels.controller";

const supplierARouter = express.Router();
const hotelController = new HotelController();
supplierARouter.get("/hotels" , (req , res)=>hotelController.filterHotels(req,res))





export default supplierARouter;



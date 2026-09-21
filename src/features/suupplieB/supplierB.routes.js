import express from "express";
import HotelController from "./hotels.controller";

const supplierBRouter = express.Router();
const hotelController = new HotelController();
supplierBRouter.get("/hotels" , (req , res)=>hotelController.filterHotels(req,res))


export default supplierBRouter;



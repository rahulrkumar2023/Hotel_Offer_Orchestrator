import express from "express";
import HotelController from "./hotels.controller";

const supplierARouter = express.Router();
const hotelController = new HotelController();





export default supplierARouter;



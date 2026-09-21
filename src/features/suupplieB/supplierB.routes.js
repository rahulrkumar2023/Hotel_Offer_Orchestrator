import express from "express";
import HotelController from "./hotels.controller";

const supplerBRouter = express.Router();
const hotelController = new HotelController();


export default supplerBRouter;



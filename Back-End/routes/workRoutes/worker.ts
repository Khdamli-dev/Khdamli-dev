import express, { Router } from 'express'
import { getWorkers } from '../../controller/workerController/getWorkers';



const worker : Router= express.Router();
worker.get('/',getWorkers);
export default worker;
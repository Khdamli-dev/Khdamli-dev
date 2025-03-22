import express, { Router } from 'express'
import { getWorker } from '../../controller/workerController/getWorker';



const worker : Router= express.Router();
worker.get('/',getWorker);
export default worker;
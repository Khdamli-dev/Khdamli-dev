import express, { Router } from 'express';
import getRegions from '../utils/address/getRegions';
import getCities from '../utils/address/getCities';

const address: Router = express.Router();

address.get('/regions', getRegions);
address.get('/cities', getCities);

export default address;
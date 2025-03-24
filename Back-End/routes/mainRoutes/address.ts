import express, { Router } from 'express';
import getRegions from '../../utils/address/getRegions';
import getCities from '../../utils/address/getCities';

const address: Router = express.Router();

address.get('/regions/:country', getRegions);
address.get('/cities/:region', getCities);

export default address;
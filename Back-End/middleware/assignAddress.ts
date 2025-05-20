import { NextFunction, Request, Response } from "express";
import address from "../interface/address";
import findAddressId from "../utils/address/findAddressId";
import createAddress from "../utils/address/createAddress";

const assignAddress = async ( req: Request , res : Response , next : NextFunction)=>{
    try {
      if (!req.body.personalInfo?.address){
        next();
        return;
      }
      const { region, city, street, addressNumber }: address = req.body.personalInfo.address;
      if (!region) {
        res.status(400).json({ message: 'region is required'});
        return;
      }
      let result: number = await findAddressId({ region, city, street, addressNumber });
      if (result == 0)
        result = await createAddress({ region, city, street, addressNumber });
      // assign address id to personal info object
      req.body.personalInfo.address = result;
      next();
    } catch (error) {
      res.status(500).json({ message: 'internal error' });
    };
};

export default assignAddress;
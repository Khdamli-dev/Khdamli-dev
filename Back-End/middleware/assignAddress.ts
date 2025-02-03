import { NextFunction, Request, Response } from "express";
import address from "../interface/address";
import findAddressId from "../utils/validator/findAddressId";
import createAddress from "../utils/address/createAddress";

const assignAddress = async ( req: Request , res : Response , next : NextFunction)=>{
    try {
        const { region, city, street, addressNumber }: address = req.body;
        if (!region) {
          res.status(400).json({ message: 'region is required'});
          return;
        }
        let result = await findAddressId({ region , city , street , addressNumber });
        if (result === 0){
        result = await createAddress({ region, city, street, addressNumber });
        };
        req.body.address = result;
        next();
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'internal error' });
      };
};
export default assignAddress;
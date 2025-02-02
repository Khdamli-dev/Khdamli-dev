import { NextFunction, Request, Response } from "express";
import address from "../interface/address";
import findAddressId from "../utils/validator/findAddressId";

const checkAddress = async ( req: Request , res : Response , next : NextFunction)=>{
    try {
        const { region, city, street, addressNumber }: address = req.body;
        if (!region) {
          res.status(200).json({
              message: 'username, email, phone number, password are required',
            });
          return;
        }
        const result = await findAddressId({ region , city , street , addressNumber });
        // if all info are valid jump to create account else we return errors of not valid info
        if (result !== 0){
          res.status(400).json({
          id : result
          }); 
          return;
        }
        next();
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'internal error' });
      };
};
export default checkAddress;
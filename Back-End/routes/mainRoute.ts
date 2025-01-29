import express from 'express';

const mainRouter = express.Router();

mainRouter.get('/',(req,res) => {
    res.send("this is main route");
});

export default mainRouter;
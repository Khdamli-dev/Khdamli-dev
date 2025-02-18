import express from 'express';
import dotenv from 'dotenv';
import mainRouter from './routes/mainRoutes/mainRoute';

dotenv.config();
const app = express();
const port = process.env.PORT;

// allow transfer json data to requests
app.use(express.json());

// make the main route
app.use('/', mainRouter);

app.listen(port, () => {
  console.log(`app listen in port ${port}`);
});

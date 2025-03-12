import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import mainRouter from './routes/mainRoutes/mainRoute';
import { initializeWebSocket } from './config/websocket';

dotenv.config();

const app = express();
const server = http.createServer(app); // http server
const port = process.env.PORT;

// allow transfer json data to requests
app.use(express.json());

// make the main route
app.use('/', mainRouter);

// initialize websocket
initializeWebSocket(server);

server.listen(port, () => {
  console.log(`app listen in port ${port}`);
});

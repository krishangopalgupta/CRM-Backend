import express from 'express';
import dotenv from 'dotenv';
import dns from 'node:dns';

dotenv.config();

const app = express();
const PORT = process.env.PORT

// global middlewares

// for converting the http incoming data to json
app.use(express.json());

// for form data
app.use(express.urlencoded({extended: true}))


import connectDB from './config/db.js';
import healthRouter from './routes/health.routes.js';
app.use('/api/v1', healthRouter);

dns.setServers(['8.8.8.8', '8.8.4.4']);
await connectDB();

app.listen((PORT), () => {
    console.log(`server is running on ${PORT}`);
})

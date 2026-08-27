import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}))


import healthRouter from './routes/health.routes.js';
app.use('/api/v1', healthRouter);

export default app;
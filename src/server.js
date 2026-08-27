import dotenv from 'dotenv';
import dns from "node:dns";

import app from './app.js';
import connectDB from './config/db.js';

dotenv.config();
const PORT = process.env.PORT

dns.setServers(['8.8.8.8', '8.8.4.4']);
await connectDB();

app.listen((PORT), () => {
    console.log(`server is running on ${PORT}`);
})

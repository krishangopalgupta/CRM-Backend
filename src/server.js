import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT

// global middlewares

// for converting the http incoming data to json
app.use(express.json());

// for form data
app.use(express.urlencoded({extended: true}))



app.listen((PORT), () => {
    console.log(`server is running on ${PORT}`);
})
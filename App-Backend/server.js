import "dotenv/config";

import express from 'express';
import cors from 'cors';

import { AnRoute } from './Routing/analyze.js';
import { ExRoute } from './Routing/extract.js';

// Connects to Redis as soon as the backend starts.
// The client, error logging and connection live in redis.js
import './redis.js';

const app = express();

app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.end('I am UP');
});
// Routes
app.use(AnRoute);
app.use(ExRoute);

app.listen(3000, () => {
    console.log('http://localhost:3000');
}); 

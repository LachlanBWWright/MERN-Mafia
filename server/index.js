import express from 'express';
import 'dotenv/config';
import {Server} from 'socket.io';
import cors from 'cors';
import auth from './routes/auth.js';

const app = express();
const port = process.env.PORT;


app.use(cors());

app.get('/', (req, res) => {
    res.send('Hi! This is the base directory.');
})

app.get('/backend_test', (req, res) => {
    console.log('Backend test called');
    res.send('Hi!');
})

app.listen(port, () => {
    console.log(`App listening on port: ${port}`);
})

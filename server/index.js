import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {Server} from 'socket.io';
import {createServer} from 'http';

import auth from './routes/auth.js';

const port = process.env.PORT;
const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3000']
    }
});

io.on('connection', socket => {
    console.log(socket.id); //Prints randomly generated ID to console

    socket.on('messageSentByUser', (message) => {
        console.log('Message sent text: ' + message);
        socket.broadcast.emit('receive-message', message) //Sends to every connected client barring the client sending the message
    })
})

app.get('/', (req, res) => {
    res.send('Hi! This is the base directory.');
})

app.get('/backend_test', (req, res) => {
    console.log('Backend test called');
    res.send('Hi!');
})


httpServer.listen(port, () => {
    console.log(`App listening on port: ${port}`);
})

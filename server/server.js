import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {Server} from 'socket.io';
import {createServer} from 'http';
import Room from './model/rooms/room.js';

//Server setup
const port = process.env.PORT;
const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3000']
    }
});

//Gameplay objects
var roomList = [];
for(let i = 0; i < 10; i++) {
    console.log('Creating a room!');
    roomList.push(new Room(10, io));
}



io.on('connection', socket => {
    console.log(socket.id); //Prints randomly generated ID to console

    //Handle users sending a chat message
    socket.on('messageSentByUser', (message, name, room) => {
        console.log('Message sent text: ' + message + ' Name: ' + name + ' Room: ' + room);
        socket.broadcast.emit('receive-message', message) //Sends to every connected client barring the client sending the message
    });

    //Handle players joining a room
    //TODO: Give an error if the room is full
    socket.on('playerJoinRoom', (name, room) => {
        console.log('Joining: ' + name + ' ' + room);
        socket.join(room); //Joins room, messages will be received accordingly
        roomList.find(foundRoom => foundRoom.name===room).addPlayer(socket.id, name)
    });



})

app.get('/', (req, res) => {
    res.send('Hi! This is the base directory.');
})

app.get('/backend_test', (req, res) => {
    console.log('Backend test called');
    res.send('Hi!');
})

/* 
ROOMS
 */

app.get('/getRooms', (req, res) => {
    let roomJson = [];
    

    for(let i = 0; i < roomList.length; i++) {
        if(!roomList[i].started) {
            let roomItem = {};
            roomItem.name = roomList[i].name;
            roomItem.size = roomList[i].size;
            roomItem.playerCount = roomList[i].playerCount;
            roomJson.push(roomItem);
            //console.log(JSON.stringify(roomItem));
        }
    }
    //console.log(JSON.stringify(roomJson));

    res.json(roomJson); //TODO: Change this to return the bare minimum
    
});

httpServer.listen(port, () => {
    console.log(`App listening on port: ${port}`);
})


export {io};
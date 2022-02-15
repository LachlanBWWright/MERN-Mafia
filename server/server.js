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

//Creates the first batch of rooms
var roomList = [];
for(let i = 0; i < 3; i++) {
    console.log('Creating a room!');
    roomList.push(new Room(4, io));
}

io.on('connection', socket => {
    //Handle users sending a chat message 
    socket.on('messageSentByUser', (message, name, room) => {
        console.log('Message sent text: ' + message + ' Name: ' + name + ' Room: ' + room);
        roomList.find(foundRoom => foundRoom.name===room).handleSentMessage(socket.id, message)
    });

    //Handle players joining a room
    socket.on('playerJoinRoom', (name, room, cb) => {
        console.log('Joining: ' + name + ' ' + room);
        socket.join(room); //Joins room, messages will be received accordingly
        try {
            roomList.find(foundRoom => foundRoom.name===room).addPlayer(socket.id, name);
            cb((roomList.find(foundRoom => foundRoom.name===room).isInRoom(socket.id)));
        }
        catch {
            cb(false); //If a room isn't found, socketio tries to callback null.
        }
    });
    
    //TODO: Handle users disconnecting
})

app.get('/', (req, res) => {
    res.send('Hi! This is the base directory.');
})

app.get('/backend_test', (req, res) => {
    console.log('Backend test called');
    res.send('Hi!');
})


//Sends a list of room to the client - For the room list page
app.get('/getRooms', (req, res) => {
    let roomJson = [];
    
    //Adds each available room to the JSON that is returned.
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
    //TODO: Create a new room if there less than a specified number available

    res.json(roomJson); 
    
});

httpServer.listen(port, () => {
    console.log(`App listening on port: ${port}`);
})


export {io};
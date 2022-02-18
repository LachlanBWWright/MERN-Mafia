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
    roomList.push(new Room(4, io, 'vanillaGame'));
}

io.on('connection', socket => {
    //Handle users sending a chat message 
    socket.on('messageSentByUser', (message, name, room) => {
        try {
            if(message.length > 0 && message.length <= 150) {
                console.log('Message sent text: ' + message + ' Name: ' + name + ' Room: ' + room);
                roomList.find(foundRoom => foundRoom.name===room).handleSentMessage(socket.id, message);
            }

        }
        catch (error) {
            console.log(error);
        }
    });

    //Handle players joining a room
    socket.on('playerJoinRoom', (name, room, cb) => {  
        try {
            name = name.toLowerCase().replace(/[^a-zA-Z]+/g, '');
            if(name.length >=3 && name.length <= 12) {  
                console.log('Joining: ' + name + ' ' + room);
                socket.join(room); //Joins room, messages will be received accordingly
                roomList.find(foundRoom => foundRoom.name===room).addPlayer(socket.id, name);
                console.log('IsInRoomTest')
                cb((roomList.find(foundRoom => foundRoom.name===room).isInRoom(socket.id)));
                socket.data.roomName = room; //Stores the name of the room for handling disconnects
            }
        }
        catch (error) {
            console.log('CatchTest: ' + error)
            cb(false); //If a room isn't found, socketio tries to callback null.
        }
    });
    
    //Handles users disconnecting from a room
    socket.on('disconnect', (reason => {
        console.log(socket.data.roomName);
        try {
            if(socket.data.roomName != undefined) {
                roomList.find(foundRoom => foundRoom.name===socket.data.roomName).removePlayer(socket.id); //Finds the room, tells it to disconnect the user
            }
        }
        catch (error) {
            console.log('Disconnect error: ' + error);
        }
    }));
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
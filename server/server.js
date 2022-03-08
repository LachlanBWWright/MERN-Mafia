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
function createRooms(roomArray) {
    for(let i = 0; i < 3; i++) {
        roomArray.push(new Room(4, io, 'vanillaGame'));
    }
    roomArray.push(new Room(8, io, 'vanillaGame'));
}
createRooms(roomList);

io.on('connection', socket => {
    //Handle users sending a chat message 
    socket.on('messageSentByUser', (message, name, room) => {
        try {
            if(message.length > 0 && message.length <= 150) {
                socket.data.roomObject.handleSentMessage(socket.id, message);
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
                socket.join(room); //Joins room, messages will be received accordingly
                socket.data.roomObject = roomList.find(foundRoom => foundRoom.name===room)
                
                socket.data.roomObject.addPlayer(socket.id, name);
                /* socket.data.roomObject.emitPlayerList(socket.id); */
                cb(socket.data.roomObject.isInRoom(socket.id));
            }
        }
        catch (error) {
            console.log('CatchTest: ' + error)
            cb(false); //If a room isn't found, socketio tries to callback null.
        }
    });
    
    //Handles users disconnecting from a room
    socket.on('disconnect', (reason => {
        try {
            if(socket.data.roomObject != undefined) {
                socket.data.roomObject.removePlayer(socket.id);
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

//Sends a list of room to the client - For the room list page
app.get('/getRooms', (req, res) => {
    try {
        let roomJson = [];
        //Adds each available room to the JSON that is returned.
        for(let i = 0; i < roomList.length; i++) {
            if(!roomList[i].started) {
                let roomItem = {};
                roomItem.name = roomList[i].name;
                roomItem.size = roomList[i].size;
                roomItem.playerCount = roomList[i].playerCount;
                roomJson.push(roomItem);
            }
            else { //Aims to replace the removed room with a new, identical room
                roomList[i] = new Room(roomList[i].size, io, roomList[i].roomType);
                i--; //Otherwise the new room won't be added to roomJson.
            }
        }
        res.json(roomJson);   
    }
    catch(error) {
        console.log(error);
    }
});

httpServer.listen(port, () => {
    console.log(`App listening on port: ${port}`);

})

export {io};
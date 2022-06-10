import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {Server} from 'socket.io';
import {createServer} from 'http';
import {MongoClient} from 'mongodb';
import Room from './model/rooms/room.js';
import path from 'path'; //NEW HEROKU

const __dirname = path.resolve();

//Server setup
const port = process.env.PORT || 8000;
const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname + "/client/build"))); //Serves the web app

const databaseServer = new MongoClient(process.env.ATLAS_URI) //TODO: ADD proper url

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3000']
    }
});

//Creates the first batch of rooms
var roomList = [];
function createRooms(roomArray) {
    roomArray.push(new Room(20, io, 'balancedGame'));
    roomArray.push(new Room(15, io, 'balancedGame'));
    roomArray.push(new Room(10, io, 'balancedGame'));
    roomArray.push(new Room(7, io, 'balancedGame'));
    roomArray.push(new Room(4, io, 'balancedGame'));
}
createRooms(roomList);

io.on('connection', socket => {
    socket.on('getRoomList', (cb) => {
        try {
            let roomJson = [];
            //Adds each available room to the JSON that is returned.
            for(let i = 0; i < roomList.length; i++) {
                if(!roomList[i].started) {
                    let roomItem = {};
                    roomItem.name = roomList[i].name;
                    roomItem.roomType = roomList[i].roomType;
                    roomItem.size = roomList[i].size;
                    roomItem.playerCount = roomList[i].playerCount;
                    roomJson.push(roomItem);
                }
                else { //Aims to replace the removed room with a new, identical room
                    roomList[i] = new Room(roomList[i].size, io, roomList[i].roomType);
                    i--; //Otherwise the new room won't be added to roomJson.
                }
            }
            cb(roomJson);   
        }
        catch(error) {
            console.log(error);
        }
    })

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
                
                let successNumber = socket.data.roomObject.addPlayer(socket.id, name);
                /* cb(socket.data.roomObject.isInRoom(socket.id)); */
                cb(successNumber);
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

//For serving up the react app 
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});


httpServer.listen(port, () => {
    console.log(`App listening on port: ${port}`);

})

export {io};
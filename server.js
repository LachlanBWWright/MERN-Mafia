import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {Server} from 'socket.io';
import {createServer} from 'http';
//import {MongoClient} from 'mongodb';
import mongoose from 'mongoose'
import Room from './model/rooms/room.js';
import path from 'path';
import axios from 'axios'

const __dirname = path.resolve();

//Server setup
const port = process.env.PORT || 8000;
const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname + "/client/build"))); //Serves the web app

//const databaseServer = new MongoClient(process.env.ATLAS_URI) //TODO: ADD proper url
mongoose.connect(process.env.ATLAS_URI)

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3000']
    }
});

//Creates the first batch of rooms
var roomList = [];
function createRooms(roomArray) {
    roomArray.push(new Room(20, io, mongoose));
    roomArray.push(new Room(13, io, mongoose));
    roomArray.push(new Room(4, io, mongoose));
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
                    roomList[i] = new Room(roomList[i].size, io, mongoose);
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
    socket.on('playerJoinRoom', async (room, captchaToken, cb) => {  
        try {
            console.log("Token " + captchaToken)
            console.log(process.env.CAPTCHA_KEY)
            let res =  await axios.post(`https://www.google.com/recaptcha/api/siteverify?response=${captchaToken}&secret=${process.env.CAPTCHA_KEY}`)
            let score = res.data.score
            console.log(res.data)
            if(score >= 0.7) {  //Blocks players from joining if ReCaptcha V3 score is too low 
                socket.join(room); //Joins room, messages will be received accordingly
                socket.data.roomObject = roomList.find(foundRoom => foundRoom.name===room)
                
                let result = socket.data.roomObject.addPlayer(socket.id);
                console.log("TEST")
                cb(result);
            }
            else cb(2)
        }
        catch (error) {
            console.log('CatchTest: ' + error)
            //cb(2); //If a room isn't found, socketio tries to callback null.
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
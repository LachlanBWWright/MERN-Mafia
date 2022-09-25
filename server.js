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
let playRoom = new Room(io, mongoose);

io.on('connection', socket => {
    //Handle players joining a room
    socket.on('playerJoinRoom', async (captchaToken, cb) => {  
        try {
            let res =  await axios.post(`https://www.google.com/recaptcha/api/siteverify?response=${captchaToken}&secret=${process.env.CAPTCHA_KEY}`)
            let score = res.data.score
            if(score >= 0.7) {  //Blocks players from joining if ReCaptcha V3 score is too low 
                if(playRoom.started) playRoom = new Room(io, mongoose);
                socket.data.roomObject = playRoom;
                socket.join(playRoom.name); //Joins room, messages will be received accordingly
                let result = socket.data.roomObject.addPlayer(socket);
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

    //Handle users sending a chat message to all other players
    socket.on('messageSentByUser', (message, isDay) => {
        try {
            if(message.length > 0 && message.length <= 150) {
                socket.data.roomObject.handleSentMessage(socket, message, isDay);
            }
        }
        catch (error) {
            console.log(error);
        }
    });
    
    //Handles a player voting for another player - Recipient is the player's position in the array
    socket.on('handleVote', (recipient, isDay) => {
        try {
            if(typeof recipient === 'number') {
                socket.data.roomObject.handleVote(socket, recipient, isDay);
            }
        }
        catch (error) {
            console.log(error);
        }
    });
    
    //Handles a player visiting another player - Recipient is the player's position in the array
    socket.on('handleVisit', (recipient, isDay) => {
        try {
            if(typeof recipient === 'number') {
                socket.data.roomObject.handleVisit(socket, recipient, isDay);
            }
        }
        catch (error) {
            console.log(error);
        }
    })
    
    //Handles a player whispering to another player - Recipient is the player's position in the array
    socket.on('handleWhisper', (recipient, message, isDay) => {
        try {
            if(typeof recipient === 'number' && message.length > 0 && message.length <= 150) {
                socket.data.roomObject.handleWhisper(socket, recipient, message, isDay);
            }
        }
        catch (error) {
            console.log(error);
        }
    });



})

//For serving up the react app 
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});


httpServer.listen(port, () => {
    console.log(`App listening on port: ${port}`);
})

export {io};
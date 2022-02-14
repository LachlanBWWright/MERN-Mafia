import Crypto from 'crypto';
import RoleHandler from '../roles/roleHandler.js'

//TODO: Create player as a class? (Maybe?)

class Room {
    constructor(size, io) {
        //SocketIo
        this.io = io;

        //Data relating to the players in the room
        this.name = Crypto.randomBytes(8).toString('hex'); //Generates the room's name
        this.size = size; //Capacity of the room
        this.playerCount = 0; //Number of players currently in the room
        this.playerList = []; //List of players in the room, containing this.player objects
        
        //Data relating to the state of the game.
        this.started = false; //Records if the game has started (So it can't be joined)
        this.time = ''; //The time of day (Night, day, voting period)
        this.roleList = [];
    }

    //TODO: Change roomName to this.name
    addPlayer(playerSocketId, playerUsername, roomName) {
        if(this.playerCount === this.size) {
            return false; //Sends error if the room is full TODO: Make server.js use the return
        }

        this.io.to(roomName).emit('receive-message', (playerUsername + ' has joined the room!'));

        let player = {};
        player.socketId = playerSocketId;
        player.playerUsername = playerUsername;
        this.playerList.push(player); //Adds a player to the array
        console.log('Player Added! Socket ID: ' + playerSocketId + ' Player Name: ' + playerUsername + ' ' + JSON.stringify(player));
        
        this.playerCount = Object.keys(this.playerList).length; //Updates the player count
        if(this.playerCount === this.size) {
            //TODO: Start the game
            this.started = true;
            this.io.to(roomName).emit('receive-message', 'The room is full! Starting the game!');
            this.io.to(roomName).emit('receive-message', 'The list of living players is: TBA'); //TODO: List players
            this.startGame();
        }
    }

    startGame() {
        let roleHandler = new RoleHandler(this.playerCount, 'vanillaGame'); //TODO: Make the game type a part of the constructor
        this.roleList.push(...roleHandler.assignGame()); //The function returns an array of 'roles' classes, and appends them to the empty rolelist array
        console.log(JSON.stringify(this.roleList));
        
        //Announces the roles in the game to the chat window
        let roleAnnounce = 'The roles present in this game are: ';
        for(let i = 0; i < this.roleList.length - 1; i++) { //Builds
            roleAnnounce = roleAnnounce.concat(this.roleList[i].name + ', ');
        }
        roleAnnounce = roleAnnounce.concat('and ' + this.roleList[this.roleList.length - 1].name + '.');
        this.io.to(this.name).emit('receive-message', roleAnnounce);
        
        /*  
        function shuffle(array) {
            let currentIndex = array.length,  randomIndex;

            // While there remain elements to shuffle...
            while (currentIndex != 0) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;

                // And swap it with the current element.
                [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
            }

            return array;
        }
         */
    }

}

export default Room
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
        this.roleList = []; //List of role ES6 classes
    }

    addPlayer(playerSocketId, playerUsername) {
        if(this.playerCount === this.size) {
            return false; //Sends error if the room is full TODO: Make server.js use the return
        }

        this.io.to(this.name).emit('receive-message', (playerUsername + ' has joined the room!'));

        let player = {};
        player.socketId = playerSocketId;
        player.playerUsername = playerUsername;
        this.playerList.push(player); //Adds a player to the array
        console.log('Player Added! Socket ID: ' + playerSocketId + ' Player Name: ' + playerUsername + ' ' + JSON.stringify(player));
        
        this.playerCount = Object.keys(this.playerList).length; //Updates the player count
        if(this.playerCount === this.size) {
            this.started = true;
            this.io.to(this.name).emit('receive-message', 'The room is full! Starting the game!');

            //List all the players in the game.
            let playerAnnounce = 'The list of living players is: ';

            this.io.to(this.name).emit('receive-message', 'The list of living players is: TBA'); //TODO: List players
            this.startGame();
        }
    }

    //Handles users sending messages to the chat 
    //TODO: Add support for commands
    handleSentMessage(playerSocketId, message) {
        let foundPlayer = this.playerList.find(player => player.socketId === playerSocketId)
        try {
            if(this.started) { //If the game has started, handle the message with the role object
                console.log('Handle sent message test');
                if(foundPlayer.role.isAlive) {
                    this.io.to(this.name).emit('receive-message', (foundPlayer.playerUsername + ': ' + message));
                }
            }
            else { //If the game hasn't started, no roles have been assigned, just send the message directly
                this.io.to(this.name).emit('receive-message', (foundPlayer.playerUsername + ': ' + message));
            }
        }
        catch {
            console.log('Something went wrong')
        }
    }

    startGame() {
        let roleHandler = new RoleHandler(this.playerCount, 'vanillaGame', this.io);
        this.roleList.push(...roleHandler.assignGame()); //The function returns an array of 'roles' classes, and appends them to the empty rolelist array
        
        //Announces the roles in the game to the chat window
        let roleAnnounce = 'The roles present in this game are: ';
        for(let i = 0; i < this.roleList.length - 1; i++) { //Builds
            roleAnnounce = roleAnnounce.concat(this.roleList[i].name + ', ');
        }
        roleAnnounce = roleAnnounce.concat('and ' + this.roleList[this.roleList.length - 1].name + '.');
        this.io.to(this.name).emit('receive-message', roleAnnounce);
        
        //Shuffles the list of roles so that they can be randomly allocated to users
        let currentIndex = this.roleList.length;
        let randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex)  //Math.floor truncates to make integers (5.99 => 5)
            currentIndex--;

            [this.roleList[currentIndex], this.roleList[randomIndex]] = [this.roleList[randomIndex], this.roleList[currentIndex]];
        }
       
        //Allocates the shuffled rolelist to users
        for(let i = 0; i < this.playerList.length ; i++) {
            this.playerList[i].role = this.roleList[i]; //Assigns the role to the player
            this.io.to(this.playerList[i].socketId).emit('receive-message', ('Your role is: ' + this.playerList[i].role.name)) //Sends each player their role
        }
        //console.log(JSON.stringify(this.playerList));
    }

}

export default Room
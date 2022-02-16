import Crypto from 'crypto';
import RoleHandler from '../roles/roleHandler.js'

class Room {
    constructor(size, io, roomType) {
        //SocketIo
        this.io = io;

        //Data relating to the players in the room
        this.name = Crypto.randomBytes(8).toString('hex'); //Generates the room's name
        this.size = size; //Capacity of the room
        this.playerCount = 0; //Number of players currently in the room
        this.playerList = []; //List of players in the room, containing this.player objects
            //player.socketId, player.playerUsername, player.role

        //Data relating to the state of the game.
        this.started = false; //Records if the game has started (So it can't be joined)
        this.time = ''; //The time of day (Night, day, voting period)
        this.roleList = []; //List of role ES6 classes
        this.roomType = roomType //The type of the game (Determines the roles used)
        }

    //Adds a new player to the room, and makes the game start if it is full
    addPlayer(playerSocketId, playerUsername) {
        let player = {};
        player.socketId = playerSocketId;
        player.playerUsername = playerUsername;

        //Stops the user from being added if there's an existing user with the same username or socketId, or if the room is full
        for(let i = 0; i < this.playerList.length; i++) {
            if(this.playerList[i].socketId === playerSocketId || this.playerList[i].playerUsername == playerUsername || this.playerList.length == this.size) {
                return;
            }
        }

        this.io.to(this.name).emit('receive-message', (playerUsername + ' has joined the room!'));
        this.playerList.push(player); //Adds a player to the array
        console.log('Player Added! Socket ID: ' + playerSocketId + ' Player Name: ' + playerUsername + ' ' + JSON.stringify(player));
        this.playerCount = Object.keys(this.playerList).length; //Updates the player count
        
        //Starts the game if the room has filled its maximum size
        if(this.playerCount === this.size) {
            //TODO: Purge players that do not have an active connection, and abort. (Made less necessary by disconnect functionality)

            this.started = true;
            this.io.to(this.name).emit('receive-message', 'The room is full! Starting the game!');

            //List all the players in the game.
            let playerAnnounce = 'The list of living players is: ';
            for(let i = 0; i < this.playerList.length - 1; i++) {
                playerAnnounce = playerAnnounce.concat(this.playerList[i].playerUsername + ', ');
            }
            playerAnnounce = playerAnnounce.concat('and ' + this.playerList[this.playerList.length - 1].playerUsername + '.')
            this.io.to(this.name).emit('receive-message', playerAnnounce); 

            this.startGame();
        }
    }

    //Handles a player being removed if they've disconnected
    removePlayer(playerSocketId) {
        console.log('Disconnect Test');
        for(let i = 0; i < this.playerList.length; i++) {
            if(this.playerList[i].socketId === playerSocketId) {
                this.io.to(this.name).emit('receive-message', (this.playerList[i].playerUsername + ' has left the room!'))
                this.playerList.splice(i, 1); //This should remove the player from the array
            }
        }
    }

    isInRoom(playerSocketId) {
        for(let i = 0; i < this.playerList.length; i++) {
            if(this.playerList[i].socketId === playerSocketId)
                return true;
        }
        return false;
    }

    //Handles users sending messages to the chat 
    //TODO: Add support for commands
    handleSentMessage(playerSocketId, message) {
        let foundPlayer = this.playerList.find(player => player.socketId === playerSocketId)
        try {
            //TODO: Add support for help/block commands (starting with '?') as the first if-check
            if(this.started) { //If the game has started, handle the message with the role object
                console.log('Handle sent message test');
                if(foundPlayer.role.isAlive) {
                    //TODO: Add support for role commands
                    this.io.to(this.name).emit('receive-message', (foundPlayer.playerUsername + ': ' + message));
                }
                else {
                    this.io.to(playerSocketId).emit('receive-message', 'You cannot speak, as you are dead.')
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

    async startGame() {
        let roleHandler = new RoleHandler(this.playerCount, 'vanillaGame', this);
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
    }
}

export default Room
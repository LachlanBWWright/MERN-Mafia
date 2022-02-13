import Crypto from 'crypto';

class Room {
    constructor(size, io) {
        this.name = Crypto.randomBytes(8).toString('hex'); //Generates the room's name
        this.size = size; //Capacity of the room
        this.playerCount = 0; //Number of players currently in the room
        this.playerList = []; //List of players in the room, containing this.player objects
        this.started = false; //Records if the game has started (So it can't be joined)
        this.io = io;
    }

    addPlayer(playerSocketId, playerUsername) {
        let player = {};
        player.socketId = playerSocketId;
        player.playerUsername = playerUsername;
        console.log('Player Added! Socket ID: ' + playerSocketId + ' Player Name: ' + playerUsername + ' ' + JSON.stringify(player));
        
        //this.io.emit()
        this.playerList.push(player); //Adds a player to the array
        
        this.playerCount = Object.keys(this.playerList).length; //Updates the player count
    
        

    }

}

export default Room
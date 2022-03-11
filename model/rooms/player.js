class Player {
    constructor(socketId, playerUsername) {
        this.socketId = socketId;
        this.playerUsername = playerUsername;
        this.role; //The player's role (Class).
        this.isAlive = true;
        
        this.votingFor;
    }
}

export default Player;
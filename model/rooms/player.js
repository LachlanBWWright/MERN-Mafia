class Player {
    constructor(socketId, playerUsername) {
        this.socketId = socketId;
        this.playerUsername = playerUsername;
        this.role; //The player's role class
        this.isAlive = true;
        this.hasVoted = false;
        this.votesReceived = 0;
    }
}

export default Player;
class Player {
    constructor(socketId, playerUsername) {
        this.socketId = socketId;
        this.playerUsername = playerUsername;
        this.role; //The player's role (Class).
        this.isAlive = true;
    }
}

export default Player;
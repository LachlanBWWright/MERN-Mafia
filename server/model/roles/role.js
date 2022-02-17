//This is the base class for a role

class Role {
    constructor(name, description, helpText, room) {
        this.name = name; //Name of the role
        this.description = description; //Description of the role
        this.helpText = helpText; //Text that is sent 
        this.room = room; //io for SocketIo emitting
        this.isAlive = true;
    }

    handleMessage(message) {
        this.room.io.to(this.room.name).emit('receive-message', (foundPlayer.playerUsername + ': ' + message));
    }

    handlePrivateMessage(message, recipient) { //Message string, recipient's class

    }
}

export default Role
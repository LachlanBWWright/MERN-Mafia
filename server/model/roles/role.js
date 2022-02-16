//This is the base class for a role

class Role {
    constructor(name, description, room) {
        this.name = name; //Name of the role
        this.description = description; //Description of the role
        this.room = room; //io for SocketIo emitting
        this.isAlive = true;
    }

    handleMessage(message) {

    }

    handlePrivateMessage(message, recipient) { //Message string, recipient's class

    }
}

export default Role
import Role from './role.js'

class Tracker extends Role {
    constructor(room, player) {
        super('Tracker','town', room, player, 0, false, false, false, false, false, true, false);
    }

    handleNightAction(message) { //Vote on who should be attacked
        let trackee = this.room.getPlayerByUsername(message.substring(2).trim().toLowerCase()); //Removes the /c, then spaces at the front/back
        if(trackee == this.player) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot track yourself.');
        }
        else if(trackee.playerUsername != undefined && trackee.isAlive) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have chosen to track ' + trackee.playerUsername + '.');
            this.visiting = trackee.role
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'Invalid choice.');
        }
    }

    visit() { //Visits a role, and gives their defence a minimum of one
        if(this.visiting != null) {
            this.visiting.receiveVisit(this);
        }
    }

    handleVisits() {
        try {
            if(this.visiting != null) {
                if(this.visiting.visiting) this.room.io.to(this.player.socketId).emit('receive-message', 'Your target visited ' + this.visiting.visiting.player.playerUsername + '.');
                else this.room.io.to(this.player.socketId).emit('receive-message', 'Your target didn\'t visit anyone.');
            }
        }
    
        catch(error) {
            console.log(error);
        }
    }
}

export default Tracker;

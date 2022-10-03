import Role from './role.js'

class Maniac extends Role {
    constructor(room, player) {
        super('Maniac','maniac', room, player, 1, false, false, false, false, false, true, false);
    }

    handleNightAction(recipient) { //Vote on who should be attacked
        if(recipient == this.player) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot attack yourself.');
        }
        else if(recipient.playerUsername != undefined && recipient.isAlive) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have chosen to attack ' + recipient.playerUsername + '.');
            this.visiting = recipient.role;
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'Invalid choice.');
        }
    }

    visit() { //Visits a role, and gives their defence a minimum of one
        if(this.visiting != null) {
            if(this.visiting.damage == 0) {
                this.visiting.damage = 1;
            }
            this.visiting.receiveVisit(this);
        }
    }
}

export default Maniac;
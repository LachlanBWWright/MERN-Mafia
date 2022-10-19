import Role from './role.js'

class Peacemaker extends Role {
    constructor(room, player) {
        super('Peacemaker', 'neutral', room, player, 0, true, false, false, false, false, true, false, false);
        this.victoryCondition = false;
        this.room.peacemaker = this;
    }

    handleNightAction(recipient) { //Choose who should be roleblocked
        if(recipient == this.player) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot block yourself.');
        }
        else if(recipient.playerUsername != undefined && recipient.isAlive) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have chosen to block ' + recipient.playerUsername + '.');
            this.visiting = recipient.role;
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'Invalid choice.');
        }
    }

    visit() { //Visits a role, and gives their defence a minimum of one
        if(this.visiting != null) {
            this.visiting.roleblocked = true;
            this.visiting.receiveVisit(this);       
        }
    }
}

export default Peacemaker;
import Role from './role.js'

class Sniper extends Role {
    constructor(room, player) {
        super('Sniper','sniper', room, player, 1, false, false, false, false, false, true, false);

        this.lastVisited = null;
    }

    handleNightAction(recipient) { 
        if(recipient == this.player) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot snipe yourself.');
        }
        else if(recipient.playerUsername != undefined && recipient.isAlive) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have chosen to snipe ' + recipient.playerUsername + '.');
            this.visiting = recipient.role;
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'Invalid choice.');
        }
    }

    visit() { //Visits a role, and gives their defence a minimum of one
        if(this.visiting != null) {
            this.visiting.receiveVisit(this);
        }
        else this.lastVisited = null;
    }

    handleVisits() {
        if(this.visiting != null ) {
            if(this.visiting.visiting == this.visiting || this.visiting.visiting == null) {
                if(this.visiting.damage < 3) this.visiting.damage = 3;
            }
            else if(this.lastVisited == this.visiting) {
                if(this.visiting.damage == 0) this.visiting.damage = 1;
            }
            this.lastVisited = this.visiting;
        }
    }
}

export default Sniper;
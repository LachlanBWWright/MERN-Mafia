import Role from './role.js'

class Bodyguard extends Role {
    constructor(room, player) {
        super('Bodyguard', 'town', room, player, 0, false, false, false, false, false, true, false);
    }

    handleNightAction(message) { //Vote on who should be attacked
        let protectee = this.room.getPlayerByUsername(message.substring(2).trim().toLowerCase()); //Removes the /c, then spaces at the front/back
        if(protectee == this.player) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot protect yourself.');
        }
        else if(protectee.playerUsername != undefined && protectee.isAlive) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have chosen to protect ' + protectee.playerUsername + '.');
            this.visiting = protectee.role
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'Invalid choice.');
        }
    }

    visit() { //Visits a role, and gives their defence a minimum of one
        if(this.visiting != null) {
            if(this.visiting.defence == 0) {
                this.visiting.defence = 1; //Makes the protectee's defence at least 1
            }
            this.visiting.receiveVisit(this);
        }
    }

    handleVisits() {
        if(this.visiting != null) {
            for(let i = 0; i < this.visiting.visitors.length; i++) {
                if(this.visiting.visitors[i] != this && this.visiting.visitors[i] != this.visiting) {
                    if(this.visiting.visitors[i].damage == 0) this.visiting.visitors[i].damage = 1;
                    this.visiting.visitors[i].attackers.push(this);
                }
            }
        }
    }
}

export default Bodyguard;
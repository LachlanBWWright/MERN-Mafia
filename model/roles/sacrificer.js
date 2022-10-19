import Role from './role.js'

class Sacrificer extends Role {
    constructor(room, player) {
        super('Sacrificer','town', room, player, 0, false, false, false, false, false, true, false, false);
    }

    handleNightAction(recipient) { //Vote on who should be attacked
        if(recipient == this.player) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot protect yourself.');
        }
        else if(recipient.playerUsername != undefined && recipient.isAlive) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have chosen to protect ' + recipient.playerUsername + '.');
            this.visiting = recipient.role
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'Invalid choice.');
        }
    }

    visit() {
        if(this.visiting != null) { 
            this.visiting.receiveVisit(this);
        }
    }

    handleVisits() {
        if(this.visiting != null && this.visiting.attackers.length > 0) {
            this.visiting.defence = 3;
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have died protecting your target.');
            this.room.io.to(this.visiting.player.socketId).emit('receive-message', 'You were attacked, but were saved by a sacrificer!');
            this.damage = 99; //Makes the sacrificer die
            for(let i = 0; i < this.visiting.attackers.length; i++) {
                this.room.io.to(this.visiting.player.socketId).emit('receive-message', 'You were attacked by ' + this.visiting.attackers[i].player.playerUsername + ', whose role is: ' + this.visiting.attackers[i].name + '.');
            }
        }
    }
}

export default Sacrificer;
import Role from './role.js'

class Fortifier extends Role {
    constructor(room, player) {
        super('Fortifier', 'town', room, player, 0, false, false, false, false, false, true, false);

        this.playerFortified = null;
        this.canFortify = true;
    }

    handleNightAction(recipient) { //Vote on who should be attacked
        if(recipient == this.player) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot fortify your own house.');
        }
        else if(recipient.playerUsername != undefined && recipient.isAlive && this.canFortify) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have chosen to fortify ' + recipient.playerUsername + '\'s house.');
            this.visiting = recipient.role
        }
        else if(this.playerFortified != null) {
            if(recipient.playerUsername != undefined && this.playerFortified.player.isAlive && !this.canFortify) {
                this.room.io.to(this.player.socketId).emit('receive-message', 'You have chosen to try and remove ' + this.playerFortified.player.playerUsername + '\'s fortifications.');
                this.visiting = recipient.role
            }
            else {
                this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot remove the fortifications from a dead player\'s house.');
            }
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'Invalid choice.');
        }
    }

    visit() { //Builds the fortifications
        if(this.visiting != null) {
            this.visiting.receiveVisit(this);
            if(this.canFortify) { //Builds fortifications
                this.canFortify = false;
                this.visiting.baseDefence += 2;
                this.playerFortified = this.visiting;
                this.room.io.to(this.playerFortified.player.socketId).emit('receive-message', 'Your house has been fortified!');
            }
            else { //Attempts to remove fortifications
                this.visiting.baseDefence -= 2;
                if(Math.random() > 0.5) {
                    this.room.io.to(this.player.socketId).emit('receive-message', 'You died stripping the house of your fortifications.');
                    this.room.io.to(this.playerFortified.player.socketId).emit('receive-message', `${this.playerFortified.player.playerUsername} died stripping your house of its fortifications.`);
                    this.damage = 999;
                }
                else {
                    this.room.io.to(this.player.socketId).emit('receive-message', 'You stripped the house of its fortifications, and killed the owner.');
                    this.room.io.to(this.playerFortified.player.socketId).emit('receive-message', 'You died trying to stop your house from being stripped of its fortifications.');
                    this.playerFortified.damage = 999;
                }
            }
        }
    }

    handleVisits() { //Attacks the attackers of the fortified person's house  
        if(this.playerFortified != null) {
            for(let i = 0; i < this.playerFortified.attackers.length; i++) {
                if(this.visiting.attackers[i] != this && this.visiting.attackers[i] != this.visiting) {
                    if(this.visiting.attackers[i].damage == 0) this.visiting.attackers[i].damage = 1;
                    this.visiting.visitors[i].attackers.push(this);
                }
            }   
        }
    }
}

export default Fortifier;
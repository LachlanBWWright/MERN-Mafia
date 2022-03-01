import Role from './role.js'

class Fortifier extends Role {
    constructor(room, player) {
        super('Fortifier', 'Once per game, you can choose to fortify someone\s house. They will survive most attacks, and if you\'re alive, you can kill the attackers. If you regret your decision, you can try to take their defences down, but a brawl will ensue, killing one of you at random.', 
        'town', 'At night, use /c playerName to choose whose house to fprtofu. Type /c playerName again to try and remove their defences.', room, player, 0, false);

        this.playerFortified = null;
        this.canFortify = true;
    }

    handleNightAction(message) { //Vote on who should be attacked
        let fortifee = this.room.getPlayerByUsername(message.substring(2).trim().toLowerCase()); //Removes the /c, then spaces at the front/back

        if(fortifee == this.player) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot fortify your own house.');
        }
        else if(fortifee.playerUsername != undefined && fortifee.isAlive && this.canFortify) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have chosen to fortify ' + fortifee.playerUsername + '\'s house.');
            this.visiting = fortifee.role
        }
        else if(this.playerFortified != null) {
            if(fortifee.playerUsername != undefined && this.playerFortified.player.isAlive && !this.canFortify) {
                this.room.io.to(this.player.socketId).emit('receive-message', 'You have chosen to try and remove ' + this.playerFortified.player.playerUsername + '\'s fortifications.');
                this.visiting = fortifee.role
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
                    this.room.io.to(this.playerFortified.player.socketId).emit('receive-message', 'You died stripping the house of your fortifications.');
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
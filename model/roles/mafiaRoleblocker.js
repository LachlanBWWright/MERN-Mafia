import RoleMafia from './roleMafia.js'

class MafiaRoleblocker extends RoleMafia {
    constructor(room, player) {
        super('Mafia Roleblocker', 'mafia', room, player, 0, false, false, false, false, false, true, false, true);
        this.attackVote;
    }

    handleNightVote(recipient) {
        this.attackVote = recipient
        if(this.attackVote.playerUsername != undefined && this.attackVote.role.faction != this.faction && this.attackVote.isAlive) {
            this.faction.sendMessage(this.player.playerUsername + ' has voted to attack ' + this.attackVote.playerUsername + '.');
            this.attackVote = this.attackVote.role; //uses role for easier visiting
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'Invalid Vote.');
        }
    }

    handleNightAction(recipient) { //Vote on who should be attacked
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

    cancelNightAction() { //Faction-based classes should override this function
        this.room.io.to(this.player.socketId).emit('receive-message', 'You have cancelled your class\' nighttime action.');
        this.attackVote = null;
    }

    visit() { //This visits a role and attacks them. this.visiting is dictated by the faction Class.
        //super.visit();
        if(this.visiting != null) {
            this.visiting.receiveVisit(this);
            if(this.visiting.damage == 0) this.visiting.damage = 1; //Attacks the victim
            this.visiting.attackers.push(this);
        }
    }
}

export default MafiaRoleblocker;
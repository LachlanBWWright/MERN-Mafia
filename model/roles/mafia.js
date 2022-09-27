import Role from './role.js'

class Mafia extends Role {
    constructor(room, player) {
        super('Mafia', 'mafia', room, player, 0, false, false, false, false, false, true, false);
        this.attackVote;
    }

    handleNightAction(recipient) { //Vote on who should be attacked
        //TODO: Make sure attackVote if for a proper class
        this.attackVote = recipient
        if(this.attackVote.playerUsername != undefined && this.attackVote.role.faction != this.faction && this.attackVote.isAlive) {
            this.faction.sendMessage(this.player.playerUsername + ' has voted to attack ' + this.attackVote.playerUsername + '.');
            this.attackVote = this.attackVote.role; //uses role for easier visiting
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'Invalid Vote.');
        }
    }

    cancelNightAction() { //Faction-based classes should override this function
        this.room.io.to(this.player.socketId).emit('receive-message', 'You have cancelled your class\' nighttime action.');
        this.attackVote = null;
    }

    visit() { //This visits a role and attacks them. this.visiting is dictated by the faction Class.
        if(this.visiting != null) {
            this.visiting.receiveVisit(this);
            if(this.visiting.damage == 0) this.visiting.damage = 1; //Attacks the victim
            this.visiting.attackers.push(this);
        }
    }
}

export default Mafia;
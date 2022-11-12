import Role from './role.js'

class RoleMafia extends Role {
    constructor(name, group, room, player, baseDefence, roleblocker, dayVisitSelf, dayVisitOthers, dayVisitFaction, nightVisitSelf, nightVisitOthers, nightVisitFaction, nightVote) {
        //Group is kept as a constructor parameter for consistency, but mafia classes will always be in the 'mafia' group.
        super(name, 'mafia', room, player, baseDefence, roleblocker, dayVisitSelf, dayVisitOthers, dayVisitFaction, nightVisitSelf, nightVisitOthers, nightVisitFaction, nightVote);
        this.attackVote = null;
        this.isAttacking = false;
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
        this.handleNightVote(recipient);
    }

    cancelNightAction() { //Faction-based classes should override this function
        this.room.io.to(this.player.socketId).emit('receive-message', 'You have cancelled your class\' nighttime action.');
        this.attackVote = null;
    }

    //For when a member of the mafia attacks someone instead of 
    visit() { //This visits a role and attacks them. this.visiting is dictated by the faction Class.
        if(this.visiting != null) {
            this.visiting.receiveVisit(this);
            if(this.visiting.damage == 0) this.visiting.damage = 1; //Attacks the victim
            this.visiting.attackers.push(this);
        }
        this.isAttacking = false;
    }
}

export default RoleMafia;
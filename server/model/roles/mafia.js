import Role from './role.js'

class Mafia extends Role {
    constructor(room, player) {
        super('Mafia', 'MafiaDesc', 'mafia', 'You are Mafia!', room, player, 0);

        this.attackVote;
    }

    handleNightAction(message) { //Vote on who should be attacked
        //TODO: Make sure attackVote if for a proper class
        this.attackVote = this.room.getPlayerByUsername(message.substring(2).trim().toLowerCase()); //Removes the /c, then spaces at the front/back
        if(this.attackVote.playerUsername != undefined && this.attackVote.role.faction != this.faction) {
            this.faction.sendMessage(this.player.playerUsername + ' has voted to attack ' + this.attackVote.playerUsername);
            this.attackVote = this.attackVote.role; //uses role for easier visiting
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'Invalid Vote.');
        }
    }

    visit() { //This visits a role and attacks them. this.visiting is dictated by the faction Class.
        if(this.visiting != null) {
            console.log('Mafia attacking.');
            this.visiting.receiveVisit(this);
            this.visiting.damage = 1; //Attacks the victim
        }
    }
}

export default Mafia;
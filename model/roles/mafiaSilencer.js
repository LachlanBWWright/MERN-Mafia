import RoleMafia from './roleMafia.js'

class MafiaSilencer extends RoleMafia {
    constructor(room, player) {
        super('Mafia Silencer', 'mafia', room, player, 0, true, false, false, false, false, true, false, true);
        this.attackVote;
    }

    handleNightAction(recipient) { //Vote on who should be attacked
        if(recipient == this.player) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot silence yourself.');
        }
        else if(recipient.playerUsername != undefined && recipient.isAlive) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have chosen to silence ' + recipient.playerUsername + '.');
            this.visiting = recipient.role;
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'Invalid choice.');
        }
    }

    defaultVisit() { //This visits a role and attacks them. this.visiting is dictated by the faction Class.
        if(this.visiting != null) {
            if(this.visiting.group == 'town' || Math.random() > 0.5) {
                this.visiting.roleblocked = true;
                this.visiting.receiveVisit(this);
            }
        }
    }
    
}

export default MafiaSilencer;
import Role from './role.js'

class Doctor extends Role {
    constructor(room, player) {
        super('Doctor', 'town', room, player, 0, false, false, false, false, false, true, false);
    }

    handleNightAction(message) { //Vote on who should be attacked
        let healee = this.room.getPlayerByUsername(message.substring(2).trim().toLowerCase()); //Removes the /c, then spaces at the front/back
        if(healee == this.player) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot heal yourself.');
        }
        else if(healee.playerUsername != undefined && healee.isAlive) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have chosen to heal ' + healee.playerUsername + '.');
            this.visiting = healee.role
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'Invalid choice.');
        }
    }

    visit() { //Visits a role, and gives their defence a minimum of one
        if(this.visiting != null) {
            if(this.visiting.defence == 0) {
                this.visiting.defence = 1; //Makes the healee's defence at least 1
            }
            this.visiting.receiveVisit(this);
        }
    }

}

export default Doctor;
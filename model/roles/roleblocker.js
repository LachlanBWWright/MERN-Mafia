import Role from './role.js'

class Roleblocker extends Role {
    constructor(room, player) {
        super('Roleblocker', 'town', room, player, 0, true, false, false, false, false, true, false);
    }

    handleNightAction(message) { //Choose who should be roleblocked
        let blockee = this.room.getPlayerByUsername(message.substring(2).trim().toLowerCase()); //Removes the /c, then spaces at the front/back
        if(blockee == this.player) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot block yourself.');
        }
        else if(blockee.playerUsername != undefined && blockee.isAlive) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have chosen to block ' + blockee.playerUsername + '.');
            this.visiting = blockee.role;
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'Invalid choice.');
        }
    }

    visit() { //Visits a role, and gives their defence a minimum of one
        if(this.visiting != null) {
            if(this.visiting.group == 'town' || Math.random() > 0.5) {
                this.visiting.roleblocked = true;
                this.visiting.receiveVisit(this);
            }
        }
    }
}

export default Roleblocker;
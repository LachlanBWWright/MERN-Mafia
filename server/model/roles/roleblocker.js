import Role from './role.js'

class Roleblocker extends Role {
    constructor(room, player) {
        super('Roleblocker', 'Every night, are are able to select a person, and stop them from performing their action. If they\'re not a member of the town, you have a 50% chance of success.', 
        'town', 'At night, use /c playerName to choose who to roleblock.', room, player, 0, true);
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
            this.visiting.roleblocked = true;
            this.visiting.receiveVisit(this);
        }
    }
}

export default Roleblocker;
import Role from './role.js'

class Tapper extends Role {
    constructor(room, player) {
        super('Tapper', 'town', room, player, 0, false, false, true, false, false, true, false);
    }

    handleDayAction(message) { //Handles the class' daytime action
        let tapee = this.room.getPlayerByUsername(message.substring(2).trim().toLowerCase()); //Removes the /c, then spaces at the front/back
        if(tapee == this.player) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot tap yourself.');
        }
        else if(tapee.playerUsername != undefined && tapee.isAlive) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have chosen to tap ' + tapee.playerUsername + '.');
            this.dayVisiting = tapee.role;
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'Invalid choice.');
        }
    }

    handleNightAction(message) { //Vote on who should be attacked
        let tapee = this.room.getPlayerByUsername(message.substring(2).trim().toLowerCase()); //Removes the /c, then spaces at the front/back
        if(tapee == this.player) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot tap yourself.');
        }
        else if(tapee.playerUsername != undefined && tapee.isAlive) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have chosen to tap ' + tapee.playerUsername + '.');
            this.visiting = tapee.role;
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'Invalid choice.');
        }
    }

    dayVisit() { //Visits a player, so that the wiretapper can see any messages that they send overnight.
        if(this.dayVisiting != null) {
            this.room.io.to(this.dayVisiting.player.socketId).emit('receive-message', 'You have been wiretapped! Any message you send can be heard by a tapper.');
            this.dayVisiting.receiveDayVisit(this);
            this.dayVisiting.nightTapped = this;
        }
    }

    visit() { //Visits a player, so that the wiretapper can see who they whisper to tomorrow.
        if(this.visiting != null) {
            this.visiting.receiveVisit(this);
            this.visiting.dayTapped = this;
        }
    }
}

export default Tapper;
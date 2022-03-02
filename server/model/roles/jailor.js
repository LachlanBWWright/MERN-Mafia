import Role from './role.js'

class Jailor extends Role {
    constructor(room, player) {
        super('Jailor', 'At day, you can choose to jail a player, blocking their abilities. You can then interrogate them, and choose to execute them.', 
        'town', 'At day and night, use /c playerName to choose who to tap.', room, player, 0, false);
        this.jailee = null;
    }

    handleDayAction(message) { //Choose to jail a player
        let jailee = this.room.getPlayerByUsername(message.substring(2).trim().toLowerCase()); //Removes the /c, then spaces at the front/back
        if(jailee == this.player) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot jail yourself.');
        }
        else if(jailee.playerUsername != undefined && jailee.isAlive) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have chosen to jail ' + jailee.playerUsername + '.');
            this.dayVisiting = jailee.role;
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'Invalid choice.');
        }
    }

    handleNightAction(message) { //Choose if the player who is jailed should be executed, or let go
        if(this.dayVisiting == null) {
            //this.visiting = this;
            this.room.io.to(this.player.socketId).emit('receive-message', 'You haven\'t jailed anyone, so you cannot do anything.');
        }
        else {
            if(this.visiting == null) {
                this.visiting = this.dayVisiting;
                this.room.io.to(this.player.socketId).emit('receive-message', 'You have decided to execute the prisoner.');
                this.room.io.to(this.jailee.player.socketId).emit('receive-message', 'The jailor has decided to execute you');
            }
            else {
                this.visiting = this.dayVisiting;
                this.room.io.to(this.player.socketId).emit('receive-message', 'You have decided not to execute the prisoner.');
                this.room.io.to(this.jailee.player.socketId).emit('receive-message', 'The jailor has decided not to execute you');
            }
        }
    }

    dayVisit() { //Jails the player
        if(this.dayVisiting != null) {
            this.room.io.to(this.dayVisiting.player.socketId).emit('receive-message', 'You have been wiretapped! Any message you send can be heard by a tapper.');
            this.dayVisiting.receiveDayVisit(this);
            this.dayVisiting.nightTapped = this;
        }
    }

    visit() { //Executes the player being jailed
        if(this.visiting != null) {
            this.visiting.receiveVisit(this);
            this.visiting.dayTapped = this;
        }
    }
}

export default Jailor;
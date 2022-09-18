import Role from './role.js'

class Jailor extends Role {
    constructor(room, player) {
        super('Jailor', 'town', room, player, 0, false, false, true, false, true, false, false);
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
            if(this.visiting == null) { //To be exectued
                this.visiting = this.dayVisiting;
                this.room.io.to(this.player.socketId).emit('receive-message', 'You have decided to execute the prisoner.');
                this.room.io.to(this.dayVisiting.player.socketId).emit('receive-message', 'The jailor has decided to execute you');
            }
            else { //Cancels the execution
                this.visiting = null;
                this.room.io.to(this.player.socketId).emit('receive-message', 'You have decided not to execute the prisoner.');
                this.room.io.to(this.dayVisiting.player.socketId).emit('receive-message', 'The jailor has decided not to execute you');
            }
        }
    }

    dayVisit() { //Tells the player that they've been jailed, and roleblocks them. dayVisiting is called at the end of a day session.
        if(this.dayVisiting != null) {
            this.room.io.to(this.dayVisiting.player.socketId).emit('receive-message', 'You have been jailed!');
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have jailed your target.');
            this.dayVisiting.jailed = this;
            this.dayVisiting.roleblocked = true;
        }
    }

    visit() { //Executes the player being jailed
        if(this.visiting != null) {
            this.visiting.receiveVisit(this);
            if(this.visiting.damage < 3) this.visiting.damage = 3; //Attacks the victim
            this.visiting.attackers.push(this);
        }
    }

    handleVisits() {
        if(this.dayVisiting != null) this.dayVisiting.jailed = null; //Resets if the victim has been jailed
        if(this.dayVisiting != null) { //Protect the jailee if they weren't executed
           if(this.dayVisiting.baseDefence == 0) this.dayVisiting.defence = 1;
        }  
    }
}

export default Jailor;
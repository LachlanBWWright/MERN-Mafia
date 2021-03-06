import Role from './role.js'

class Nimby extends Role {
    constructor(room, player) {
        super('Nimby', 'Development in your neighbour\'s backyard was bad enough, but now your own property is under threat! Three times per game, you can go on alert and murder any visitors, defending yourself!', 
        'town', 'At night, use /c yourName to go on alert.', room, player, 0, false);
        this.alertSlots = 3;
    }

    handleNightAction(message) { //Vote on who should be attacked
        if(this.alertSlots == 0) this.room.io.to(this.player.socketId).emit('receive-message', 'You have no alerts left!');
        else if(this.visiting == null) {
            this.visiting = this;
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have decided to go on alert.');
        }
        else {
            this.visiting = null;
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have decided not to go on alert.');
        }
    }

    visit() { //Visits a role, and gives their defence a minimum of one
        if(this.visiting != null) {
            if(this.visiting.defence == 0) {
                this.visiting.defence = 1; //Makes the protectee's defence at least 1
                this.alertSlots--;
            }
            this.visiting.receiveVisit(this);
        }
    }

    handleVisits() {
        if(this.visiting != null) {
            for(let i = 0; i < this.visiting.visitors.length; i++) {
                if(this.visiting.visitors[i] != this && this.visiting.visitors[i] != this.visiting) {
                    if(this.visiting.visitors[i].damage == 0) this.visiting.visitors[i].damage = 1;
                    //this.visiting.attackers.push(this); Deliberately excluded at this point
                }
            }
        }
    }
}

export default Nimby;
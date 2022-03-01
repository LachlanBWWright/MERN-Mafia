import Role from './role.js'

class Lawman extends Role {
    constructor(room, player) {
        super('Lawman', 'You can choose a person to shoot every night. If you shoot a town member, you will go insane, and shoot a living player at random every night - including yourself!', 
        'town', 'At night, use /c playerName to choose who to shoot.', room, player, 0);

        this.isInsane = false;
    }

    handleNightAction(message) { //Vote on who should be attacked
        let victim = this.room.getPlayerByUsername(message.substring(2).trim().toLowerCase()); //Removes the /c, then spaces at the front/back
        if(this.isInsane) {
            //Shoot at random
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have gone insane, and have no control over who you shoot.');
        }
        else if(victim == this.player) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot shoot yourself.');
        }
        else if(victim.playerUsername != undefined && victim.isAlive) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have chosen to attack ' + victim.playerUsername + '.');
            this.visiting = victim.role
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'Invalid choice.');
        }
    }

    visit() { 
        if(this.visiting != null) { //Visits the person of the player choice
            
            if(this.isInsane) this.room.io.to(this.player.socketId).emit('receive-message', 'You have gone insane, and are shooting someone randomly!');
            if(this.visiting.visitors[i].damage == 0) this.visiting.damage = 1;
            this.visiting.attackers.push(this);

            this.visiting.receiveVisit(this);
            if(this.visiting.group == 'town') { //Go insane if a member of the town got shot
                this.isInsane = true;
                this.room.io.to(this.player.socketId).emit('receive-message', 'You just shot a member of the town, and have been driven insane by the guilt!');
            }
        }
    }
}

export default Lawman;
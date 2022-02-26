import Role from './role.js'

//This class judges the alignment of the selected target (usually!)
class Investigator extends Role {
    constructor(room, player) {
        super('Investigator', 'You can visit a player each night to check make three guesses as to their role. Each guess has a 30% chance of being correct, otherwise it will be the role of a random player.'
        , 'town', 'At night, use /c playerName to choose who to inspect.', room, player, 0);
    }
    
    handleNightAction(message) { //Vote on who should be attacked
        let inspectee = this.room.getPlayerByUsername(message.substring(2).trim().toLowerCase()); //Removes the /c, then spaces at the front/back
        if(inspectee == this.player) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot inspect yourself.');
        }
        else if(inspectee.playerUsername != undefined && inspectee.isAlive) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You have chosen to inspect ' + inspectee.playerUsername + '.');
            this.visiting = inspectee.role;
        }
        else {
            this.room.io.to(this.player.socketId).emit('receive-message', 'Invalid choice.');
        }
    }

    visit() { //Visits a role, and tries to determine their alignment.
        try {
            if(this.visiting != null) {
                this.visiting.receiveVisit(this);
                let possibleRoles = [];
                for(let i = 0; i < 3; i++) {
                    if(Math.random() < 0.3) { //Give the targets role
                        possibleRoles.push(this.visiting.name);
                    }
                    else { //Give a random player's role
                        possibleRoles.push(this.room.playerList[Math.floor(Math.random() * this.room.playerList.length)].role.name);
                    }
                }                
                this.room.io.to(this.player.socketId).emit('receive-message', (this.visiting.player.playerUsername + '\'s role might be ' + possibleRoles[0] + ', ' + possibleRoles[1] + ', or ' + possibleRoles[2] + '.'));
            }
        }
        catch (error) {
            console.log(error);
        }
    }
}

export default Investigator;
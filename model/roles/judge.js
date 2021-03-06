import Role from './role.js'

//This class judges the alignment of the selected target (usually!)
class Judge extends Role {
    constructor(room, player) {
        super('Judge', 'You can visit a player each night to check for their factional alignment. However, there is a 30% chance that you\'ll be told the alignment of a random player instead.'
        , 'town', 'At night, use /c playerName to choose who to inspect.', room, player, 0, false);
    }
    
    handleNightAction(message) { //Vote on who should be attacked
        let inspectee = this.room.getPlayerByUsername(message.substring(2).trim().toLowerCase()); //Removes the /c, then spaces at the front/back
        if(inspectee == this.player) {
            this.room.io.to(this.player.socketId).emit('receive-message', 'You cannot inspect your owm alignment.');
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
        if(this.visiting != null) {
            this.visiting.receiveVisit(this);

            if(Math.random() < 0.3) {
                let livingPlayerList = [];
                for(let i = 0; i < this.room.playerList.length; i++) {
                    if(this.room.playerList[i].isAlive) {
                        livingPlayerList.push(this.room.playerList[i]);
                    }
                }

                this.room.io.to(this.player.socketId).emit('receive-message', (this.visiting.player.playerUsername + '\'s alignment is for the ' + livingPlayerList[Math.floor(Math.random() * livingPlayerList.length)].role.group + ' faction.'));
            }
            else { //Visits the right player, and returns their group (factional alignment)
                this.room.io.to(this.player.socketId).emit('receive-message', (this.visiting.player.playerUsername + '\'s alignment is for the ' + this.visiting.group + ' faction.'));
            }

        }
    }
}

export default Judge;
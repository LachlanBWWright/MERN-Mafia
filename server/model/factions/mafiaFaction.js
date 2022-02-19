import Faction from './faction.js'

class MafiaFaction extends Faction {
    constructor(io) {
        super(io);
    }

    findMembers(playerList) {
        //Go through a list of members, add them to the this.memberList
        for(let i = 0; i < playerList.length; i++) {
            console.log('Faction test');
            if(playerList[i].role.group == 'mafia') {
                this.memberList.push(playerList[i]);
            }
        }

        this.initializeMembers(); //Then adds this faction to each relevant member's object
    }

    handleNightMessage(message, playerUsername) {
        let nightMessage = (playerUsername + ': ' + message);

        //Sends the message to every member of the faction.
        for(let i = 0; i < this.memberList.length; i++) {
            this.io.to(this.memberList[i].socketId).emit('receive-message', nightMessage);
        }
    }
}

export default MafiaFaction
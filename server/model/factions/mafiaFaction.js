import Faction from './faction.js'

class MafiaFaction extends Faction {
    constructor(io) {
        super(io);

        this.attackList = []; //The list of who should be attacked
    }

    findMembers(playerList) {
        //Go through a list of members, add them to the this.memberList
        for(let i = 0; i < playerList.length; i++) {
            if(playerList[i].role.group == 'mafia') {
                this.memberList.push(playerList[i]);
                console.log(playerList[i].role.group);
            }
        }

        this.initializeMembers(); //Then adds this faction to each relevant member's object
    }

    handleNightVote() {
        for(let i = 0; i < this.memberList.length; i++) {
            if(this.memberList[i].role.attackVote != null) this.attackList.push(this.memberList[i].role.attackVote); //Adds the vote to attack to the list
            this.memberList[i].role.attackVote = null;
        }

        let victim = this.attackList[Math.floor(Math.random() * this.attackList.length)]; //Selects a random item in the list, and uses that TODO: Consider switching to using the mode
        this.attackList = [];
        this.memberList[Math.floor(Math.random() * this.memberList.length)].role.visiting = victim; //Selects a random mafia member to make the attack
    }

    handleNightMessage(message, playerUsername) { //Mafia only chat
        let nightMessage = (playerUsername + ': ' + message);

        //Sends the message to every member of the faction.
        for(let i = 0; i < this.memberList.length; i++) {
            this.io.to(this.memberList[i].socketId).emit('receive-message', nightMessage);
        }
    }

    sendMessage(message) {
        for(let i = 0; i < this.memberList.length; i++) {
            this.io.to(this.memberList[i].socketId).emit('receive-message', message);
        }
    }
}

export default MafiaFaction
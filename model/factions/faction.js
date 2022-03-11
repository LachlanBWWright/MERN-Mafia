class Faction {
    constructor(io) {
        this.memberList = [];
        this.io = io;
    }

    initializeMembers() {
        for(let i = 0; i < this.memberList.length; i++) {
            this.memberList[i].role.assignFaction(this);   
        }
    }

    handleNightVote() { //Handles factional decisions
        console.log('This should be overridden by child classes.')
    }

    handleNightMessage(message, playerUsername) { //Handles night chat 
        console.log('handleNightMessage should be overridden by child classes.');
    }

    removeMembers() { //Removes members if they have died, or been converted to another faction
        console.log('removeMembers should be overridden by child classes.');
    }
}

export default Faction;
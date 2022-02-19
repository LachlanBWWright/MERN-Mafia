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

    handleNightMessage(message, playerUsername) {
        console.log('handleNightMessage should be overridden by child classes');
    }

}

export default Faction;
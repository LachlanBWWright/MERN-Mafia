class Faction {
    constructor() {
        this.memberList = [];
    }

    initializeMembers() {
        for(let i = 0; i < this.memberList.length; i++) {
            this.memberList[i].role.assignFaction(this);
        }
    }
}

export default Faction;
import Faction from './faction.js'

class MafiaFaction extends Faction {
    constructor() {
        //TODO: Go through the list of roles, add factions
        super();

        this.factionNameTest = "MAFIA FACTION";
    }

    findMembers(playerList) {
        //TODO: Implement
        //Go through a list of members, add them to the this.memberList
        for(let i = 0; i < playerList.length; i++) {
            console.log('Faction test');
            if(playerList[i].role.group == 'mafia') {
                console.log('Mafia member found test');
                this.memberList.push(playerList[i]);
            }
        }

        this.initializeMembers(); //Then adds this faction to each relevant member's object
    }
}

export default MafiaFaction
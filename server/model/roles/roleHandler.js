//Imports all the roles used
import Innocent from './innocent.js';
import Doctor from './doctor.js';
import Judge from './judge.js';
import Watchman from './watchman.js';
import Investigator from './investigator.js';
import Lawman from './lawman.js';
import Vetter from './vetter.js';
import Tapper from './tapper.js';
import Tracker from './tracker.js';
import Bodyguard from './bodyguard.js';

import Mafia from './mafia.js';


//Imports all the factions used
import MafiaFaction from '../factions/mafiaFaction.js';
import LawmanFaction from '../factions/lawmanFaction.js';

//This generates the an array of role classes to be used, and then returns it to the room.
class RoleHandler {
    constructor(roomSize, roomType, io) {
        this.roomSize = roomSize;
        this.roomType = roomType; //Records the type of game that is going to be played
        this.io = io;
    }

    assignGame() {
        if(this.roomType == 'vanillaGame')  {
            return this.assignVanillaGame(this.roomSize);
        }
        else if(this.roomType == 'someOtherType') console.log('Test') //TODO: Remove this sample
    }

    assignFactions() {
        if(this.roomType == 'vanillaGame')  {
            return this.assignVanillaGameFactions(this.roomSize);
        }
        else if(this.roomType == 'someOtherType') console.log('Test') //TODO: Remove this sample
    }

    //Assigns the roles for a 'vanilla game' (Innocents and mafia)
    assignVanillaGame(roomSize) {
        let roleList = []; //The array of roles to be returned to the room object roleList.push;

        switch(roomSize) {
            case 15: roleList.push(Mafia);
            case 14: roleList.push(Innocent);
            case 13: roleList.push(Innocent);
            case 12: roleList.push(Innocent); 
            case 11: roleList.push(Mafia);
            case 10: roleList.push(Innocent); 
            case 9: roleList.push(Innocent);
            case 8: roleList.push(Innocent);
            case 7: roleList.push(Mafia);
            case 6: roleList.push(Innocent);
            case 5: roleList.push(Judge);
            case 4: roleList.push(Watchman);
            case 3: roleList.push(Vetter);
            case 2: roleList.push(Mafia);
            case 1: roleList.push(Bodyguard);
                break;
            default:
                console.log('Role Assignment Error.');
        }
        return roleList;
    }

    assignVanillaGameFactions(roomSize) {
        let factionList = []; //The array of roles to be returned to the room object factionList.push;

        switch(roomSize) {
            case 15: 
            case 14:
            case 13: 
            case 12: 
            case 11: 
            case 10: 
            case 9: 
            case 8: 
            case 7: 
            case 6: 
            case 5: 
            case 4: 
            case 3:
            case 2: factionList.push(new MafiaFaction(this.io));
            case 1:
                break;
            default:
                console.log('Faction Assignment Error.');        
            }
        return factionList;
    }
}

export default RoleHandler;
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
import Nimby from './nimby.js';
import Sacrificer from './sacrificer.js';
import Fortifier from './fortifier.js';
import Roleblocker from './roleblocker.js';
import Jailor from './jailor.js';

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
        if(this.roomType == 'vanillaGame') return this.assignVanillaGame(this.roomSize);
        else if(this.roomType == 'balancedGame') return this.assignBalancedGame(this.roomSize);
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
            case 4: roleList.push(Lawman);
            case 3: roleList.push(Roleblocker);
            case 2: roleList.push(Mafia);
            case 1: roleList.push(Jailor);
                break;
            default:
                console.log('Role Assignment Error.');
        }
        return roleList;
    }

    assignBalancedGame(roomSize) { //Attempts to create a balanced rolelist by estimating the 'contribution' each role has to the town/mafia faction winning
        let roleList = []; //The array of roles to be returned to the room object roleList.push;
        let mafiaPower = 0;
        let townPower = 0;
        let randomTownList = [Doctor, Judge, Watchman, Investigator, Lawman, Vetter, Tapper, Tracker, Bodyguard, Nimby, Sacrificer, Fortifier, Roleblocker, Jailor];
        let randomMafiaList = [Mafia];

        for(let i = 0; i < roomSize; i++) { //
            let randomiser = Math.random()*40-20 //Random Integer betweek -20 and 20
            let comparativePower = townPower - mafiaPower //The comparative power of the factions. Positive if town is more powerful than the mafia

            //TODO: Add a small chance of a 'neutral' role being selected
            if(Math.random < 0.035) { //Occasionally selects a role at random, 50/50 of being town or mafia
                if(randomiser < 0) { //Add random mafia
                    let index = Math.floor(Math.random() * randomMafiaList.length);
                    let addedRole = randomMafiaList[index]
                    roleList.push(addedRole);
                    mafiaPower = mafiaPower + this.getMafiaPower(addedRole);
                    if(this.uniqueRoleCheck(addedRole)) randomMafiaList = randomMafiaList.splice(index, 1);
                }
                else { //Add random town
                    let index = Math.floor(Math.random() * randomTownList.length);
                    let addedRole = randomTownList[index]
                    roleList.push(addedRole);
                    townPower = townPower + this.getTownPower(addedRole);
                    if(this.uniqueRoleCheck(addedRole)) randomTownList = randomTownList.splice(index, 1);
                }
            }
            else if(comparativePower < 20 && comparativePower > -20) {
                if(randomiser > comparativePower) { //The weaker the town, the higher the chance of a town member being added
                    let index = Math.floor(Math.random() * randomTownList.length);
                    let addedRole = randomTownList[index]
                    roleList.push(addedRole);
                    townPower = townPower + this.getTownPower(addedRole);
                    if(this.uniqueRoleCheck(addedRole)) randomTownList = randomTownList.splice(index, 1);
                }
                else {
                    let index = Math.floor(Math.random() * randomMafiaList.length);
                    let addedRole = randomMafiaList[index]
                    roleList.push(addedRole);
                    mafiaPower = mafiaPower + this.getMafiaPower(addedRole);
                    if(this.uniqueRoleCheck(addedRole)) randomMafiaList = randomMafiaList.splice(index, 1);
                }
            }
            else if(comparativePower > 20) { //Town is too powerful - Add mafia
                let index = Math.floor(Math.random() * randomMafiaList.length);
                let addedRole = randomMafiaList[index]
                roleList.push(addedRole);
                mafiaPower = mafiaPower + this.getMafiaPower(addedRole);
                if(this.uniqueRoleCheck(addedRole)) randomMafiaList = randomMafiaList.splice(index, 1);
            }
            else if(comparativePower < -20) { //Mafia is too powerful - Add town
                let index = Math.floor(Math.random() * randomTownList.length);
                let addedRole = randomTownList[index]
                roleList.push(addedRole);
                townPower = townPower + this.getTownPower(addedRole);
                if(this.uniqueRoleCheck(addedRole)) randomTownList = randomTownList.splice(index, 1);
            }
        }
        console.log(roleList)
        return roleList; 
    };

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
            case 1: factionList.push(new LawmanFaction(this.io));
                break;
            default:
                console.log('Faction Assignment Error.');        
            }
        return factionList;
    }

    assignFactionsFromPlayerList(playerList) {
        let factionList = [];

        for(let i = 0; i < playerList.length; i++) {
            if(playerList[i].role.name === 'Lawman') {
                factionList.push(new LawmanFaction(this.io));
                break;
            }
        }

        for(let i = 0; i < playerList.length; i++) {
            if(playerList[i].role.group === 'mafia') {
                factionList.push(new MafiaFaction(this.io));
                break;
            }
        }

        return factionList;
    }

    uniqueRoleCheck(role) {
        switch(role) {
            case Jailor:
                return true;
            default: 
                return false;
        }
    }

    getTownPower(role) {
        switch(role) {
            case Innocent: return 3;
            case Doctor: return 5;
            case Judge: return 6;
            case Watchman: return 4;
            case Investigator: return 4;
            case Lawman: return 8;
            case Vetter: return 4;
            case Tapper: return 3;
            case Tracker: return 5;
            case Bodyguard: return 6;
            case Nimby: return 5;
            case Sacrificer: return 8;
            case Fortifier: return 8;
            case Roleblocker: return 5;
            case Jailor: return 12;
            default: return 0;
        }

    };

    getMafiaPower(role) {
        switch(role) {
            case Mafia: return 20;
            default: return 0;
        }
    };
}

export default RoleHandler;
//Imports all the roles used
import Innocent from './innocent.js';
import Mafia from './mafia.js';


//This generates the an array of role classes to be used, and then returns it to the room.
class RoleHandler {
    constructor(roomSize, roomType) { //TODO: Remove roomSize, roomType, get values from room object
        this.roomSize = roomSize;
        this.roomType = roomType; //Records the type of game that is going to be played
    }

    assignGame() {
        if(this.roomType == 'vanillaGame')  {
            return this.assignVanillaGame(this.roomSize);
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
            case 5: roleList.push(Innocent);
            case 4: roleList.push(Innocent);
            case 3: roleList.push(Innocent);
            case 2: roleList.push(Mafia);
            case 1: roleList.push(Innocent);
                break;
            default:
                console.log('Something went wrong with the room generator!');
        }
        return roleList;
    }
}

export default RoleHandler;
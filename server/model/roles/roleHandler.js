//Imports all the roles used
import Innocent from './innocent.js';
import Mafia from './mafia.js';


//This generates the an array of role classes to be used, and then returns it to the room.
class RoleHandler {
    constructor(roomSize, roomType, room) { //TODO: Remove roomSize, roomType, get values from room object
        this.roomSize = roomSize;
        this.roomType = roomType; //Records the type of game that is going to be played
        this.room = room; //Socketroom
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
            case 15: roleList.push(new Mafia(this.room));
            case 14: roleList.push(new Innocent(this.room));
            case 13: roleList.push(new Innocent(this.room));
            case 12: roleList.push(new Innocent(this.room)); 
            case 11: roleList.push(new Mafia(this.room));
            case 10: roleList.push(new Innocent(this.room)); 
            case 9: roleList.push(new Innocent(this.room));
            case 8: roleList.push(new Innocent(this.room));
            case 7: roleList.push(new Mafia(this.room));
            case 6: roleList.push(new Innocent(this.room));
            case 5: roleList.push(new Innocent(this.room));
            case 4: roleList.push(new Innocent(this.room));
            case 3: roleList.push(new Innocent(this.room));
            case 2: roleList.push(new Mafia(this.room));
            case 1: roleList.push(new Innocent(this.room));
                break;
            default:
                console.log('Something went wrong with the room generator!');
        }
        return roleList;
    }
}

export default RoleHandler;
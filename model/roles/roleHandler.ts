//Imports all the roles used

//Town Roles
import Doctor from "./doctor.js";
import Judge from "./judge.js";
import Watchman from "./watchman.js";
import Investigator from "./investigator.js";
import Lawman from "./lawman.js";
import Vetter from "./vetter.js";
import Tapper from "./tapper.js";
import Tracker from "./tracker.js";
import Bodyguard from "./bodyguard.js";
import Nimby from "./nimby.js";
import Sacrificer from "./sacrificer.js";
import Fortifier from "./fortifier.js";
import Roleblocker from "./roleblocker.js";
import Jailor from "./jailor.js";

//Mafia Roles
import Mafia from "./mafia.js";
import MafiaRoleblocker from "./mafiaRoleblocker.js";
import MafiaInvestigator from "./mafiaInvestigator.js";

//Neutral Roles
import Maniac from "./maniac.js";
import Sniper from "./sniper.js";
import Framer from "./framer.js";
import Confesser from "./confesser.js";
import Peacemaker from "./peacemaker.js";

//Imports all the factions used
import MafiaFaction from "../factions/mafiaFaction.js";
import LawmanFaction from "../factions/lawmanFaction.js";

import { io } from "../../servers/socket.js";
import Player from "../rooms/player.js";

//This generates the an array of role classes to be used, and then returns it to the room.
class RoleHandler {
  roomSize: number;
  constructor(roomSize: number) {
    this.roomSize = roomSize;
  }

  assignGame() {
    let roleList = []; //The array of roles to be returned to the room object roleList.push;
    let comparativePower = 0; //The comparative power, positive is in favour of town, negative in favour of the mafia

    //Role Lists
    let randomTownList = [
      Doctor,
      Judge,
      Watchman,
      Investigator,
      Lawman,
      Vetter,
      Tapper,
      Tracker,
      Bodyguard,
      Nimby,
      Sacrificer,
      Fortifier,
      Roleblocker,
      Jailor,
    ];
    let randomMafiaList = [Mafia, MafiaRoleblocker, MafiaInvestigator];
    let randomNeutralList = [Maniac, Sniper, Framer, Confesser, Peacemaker];

    for (let i = 0; i < this.roomSize; i++) {
      //
      let randomiser = Math.random() * 30 - 15; //Random Integer betweek -15 and 15
      //For testing specific roles, comment out otherwise
      /*             if(i == 0) {
                roleList.push(MafiaInvestigator);
                comparativePower += this.getPower(MafiaInvestigator);
                randomNeutralList.splice(4, 1);
                continue;
            }  */

      if (comparativePower < 15 && comparativePower > -15) {
        if (randomiser > comparativePower) {
          //The weaker the town, the higher the chance of a town member being added
          let index = Math.floor(Math.random() * randomTownList.length);
          let addedRole = randomTownList[index];
          roleList.push(addedRole);
          comparativePower += this.getPower(addedRole);
          if (this.uniqueRoleCheck(addedRole)) randomTownList.splice(index, 1);
        } else {
          //Add mafia/neutral role
          if (Math.random() > 0.3 || randomNeutralList.length == 0) {
            //Add Mafia
            let index = Math.floor(Math.random() * randomMafiaList.length);
            let addedRole = randomMafiaList[index];
            roleList.push(addedRole);
            comparativePower += this.getPower(addedRole);
            if (this.uniqueRoleCheck(addedRole))
              randomMafiaList.splice(index, 1);
          } else {
            //Add neutral role
            let index = Math.floor(Math.random() * randomNeutralList.length);
            let addedRole = randomNeutralList[index];
            roleList.push(addedRole);
            comparativePower += this.getPower(addedRole);
            if (this.uniqueRoleCheck(addedRole))
              randomNeutralList.splice(index, 1);
          }
        }
      } else if (comparativePower >= 15) {
        //Town is too powerful - Add mafia
        let index = Math.floor(Math.random() * randomMafiaList.length);
        let addedRole = randomMafiaList[index];
        roleList.push(addedRole);
        comparativePower += this.getPower(addedRole);
        if (this.uniqueRoleCheck(addedRole)) randomMafiaList.splice(index, 1);
      } else {
        //Mafia is too powerful - Add town
        let index = Math.floor(Math.random() * randomTownList.length);
        let addedRole = randomTownList[index];
        roleList.push(addedRole);
        comparativePower += this.getPower(addedRole);
        if (this.uniqueRoleCheck(addedRole)) randomTownList.splice(index, 1);
      }
    }
    return roleList;
  }

  assignFactionsFromPlayerList(playerList: Player[]) {
    let factionList = [];

    for (let i = 0; i < playerList.length; i++) {
      if (playerList[i].role.name === "Lawman") {
        factionList.push(new LawmanFaction());
        break;
      }
    }

    for (let i = 0; i < playerList.length; i++) {
      if (playerList[i].role.group === "mafia") {
        factionList.push(new MafiaFaction());
        break;
      }
    }

    return factionList;
  }

  //Returns true if a role is unique, so it can be removed from the propsective role list for additional players
  uniqueRoleCheck(role: any) {
    switch (role) {
      //Town
      case Jailor:
        return true;
      case Lawman:
        return true;

      //Mafia
      //None applicable at present

      //Neutral
      case Maniac:
        return true;
      case Sniper:
        return true;
      case Framer:
        return true;
      case Confesser:
        return true;
      case Peacemaker:
        return true;
      default:
        return false;
    }
  }

  //Returns the extent to which a role helps the town
  getPower(role: any) {
    switch (role) {
      //Town Roles
      case Doctor:
        return 5;
      case Judge:
        return 6;
      case Watchman:
        return 4;
      case Investigator:
        return 4;
      case Lawman:
        return 8;
      case Vetter:
        return 4;
      case Tapper:
        return 3;
      case Tracker:
        return 5;
      case Bodyguard:
        return 6;
      case Nimby:
        return 5;
      case Sacrificer:
        return 8;
      case Fortifier:
        return 8;
      case Roleblocker:
        return 5;
      case Jailor:
        return 12;
      //Mafia Roles
      case Mafia:
        return -13;
      case MafiaRoleblocker:
        return -20;
      case MafiaInvestigator:
        return -15;
      //Neutral Roles
      case Maniac:
        return -12;
      case Sniper:
        return -10;
      case Framer:
        return -5;
      case Confesser:
        return -5;
      case Peacemaker:
        return -2;
      default:
        return 0;
    }
  }
}

export default RoleHandler;

import { Player } from "../player/player.js";
import { Room } from "../rooms/room.js";
import { Role } from "./abstractRole.js";

//To be used as a 'temp' role, assigned to users before the game has started

export class BlankRole extends Role {
  name = "Blank Role";
  group = "unaligned";
  baseDefence = 0;
  defence = 0;
  roleblocker = false;
  dayVisitSelf = false;
  dayVisitOthers = false;
  dayVisitFaction = false;
  nightVisitSelf = false;
  nightVisitOthers = false;
  nightVisitFaction = false;
  nightVote = false;

  constructor(room: Room, player: Player) {
    super(room, player);
  }
}

import { Player } from "../../player/player.js";
import { Room } from "../../rooms/room.js";
import { Role } from "../abstractRole.js";
import { io } from "../../../servers/socket.js";

export class Maniac extends Role {
  name = "Maniac";
  group = "maniac";
  baseDefence = 1;
  defence = 1;
  roleblocker = false;
  dayVisitSelf = false;
  dayVisitOthers = false;
  dayVisitFaction = false;
  nightVisitSelf = false;
  nightVisitOthers = true;
  nightVisitFaction = false;
  nightVote = false;

  constructor(room: Room, player: Player) {
    super(room, player);
  }

  handleNightAction(recipient: Player) {
    //Vote on who should be attacked
    if (recipient == this.player) {
      io.to(this.player.socketId).emit(
        "receiveMessage",
        "You cannot attack yourself.",
      );
    } else if (recipient.playerUsername != undefined && recipient.isAlive) {
      io.to(this.player.socketId).emit(
        "receiveMessage",
        "You have chosen to attack " + recipient.playerUsername + ".",
      );
      this.visiting = recipient.role;
    } else {
      io.to(this.player.socketId).emit("receiveMessage", "Invalid choice.");
    }
  }

  visit() {
    //Visits a role, and gives their defence a minimum of one
    if (this.visiting != null) {
      if (this.visiting.damage == 0) {
        this.visiting.damage = 1;
      }
      this.visiting.receiveVisit(this);
    }
  }
}

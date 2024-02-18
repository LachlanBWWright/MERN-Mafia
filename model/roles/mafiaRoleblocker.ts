import Player from "../rooms/player.js";
import Room from "../rooms/room.js";
import RoleMafia from "./roleMafia.js";
import { io } from "../../servers/socket.js";

class MafiaRoleblocker extends RoleMafia {
  attackVote: Player | null = null;
  constructor(room: Room, player: Player) {
    super(
      "Mafia Roleblocker",
      "mafia",
      room,
      player,
      0,
      true,
      false,
      false,
      false,
      false,
      true,
      false,
      true,
    );
  }

  handleNightAction(recipient: Player) {
    //Vote on who should be attacked
    if (recipient == this.player) {
      io.to(this.player.socketId).emit(
        "receiveMessage",
        "You cannot block yourself.",
      );
    } else if (recipient.playerUsername != undefined && recipient.isAlive) {
      io.to(this.player.socketId).emit(
        "receiveMessage",
        "You have chosen to block " + recipient.playerUsername + ".",
      );
      this.visiting = recipient.role;
    } else {
      io.to(this.player.socketId).emit("receiveMessage", "Invalid choice.");
    }
  }

  defaultVisit() {
    //This visits a role and attacks them. this.visiting is dictated by the faction Class.
    if (this.visiting != null) {
      if (this.visiting.group == "town" || Math.random() > 0.5) {
        this.visiting.roleblocked = true;
        this.visiting.receiveVisit(this);
      }
    }
  }
}

export default MafiaRoleblocker;

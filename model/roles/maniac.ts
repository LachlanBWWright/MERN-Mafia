import Player from "../rooms/player.js";
import Room from "../rooms/room.js";
import Role from "./role.js";
import { io } from "../../servers/socket.js";

class Maniac extends Role {
  constructor(room: Room, player: Player) {
    super(
      "Maniac",
      "maniac",
      room,
      player,
      1,
      false,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
    );
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

export default Maniac;

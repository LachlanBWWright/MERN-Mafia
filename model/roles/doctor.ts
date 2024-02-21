import { Player } from "../rooms/player.js";
import { Room } from "../rooms/room.js";
import { Role } from "./role.js";
import { io } from "../../servers/socket.js";

export class Doctor extends Role {
  constructor(room: Room, player: Player) {
    super(
      "Doctor",
      "town",
      room,
      player,
      0,
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
        "You cannot heal yourself.",
      );
    } else if (recipient.playerUsername != undefined && recipient.isAlive) {
      io.to(this.player.socketId).emit(
        "receiveMessage",
        "You have chosen to heal " + recipient.playerUsername + ".",
      );
      this.visiting = recipient.role;
    } else {
      io.to(this.player.socketId).emit("receiveMessage", "Invalid choice.");
    }
  }

  visit() {
    //Visits a role, and gives their defence a minimum of one
    if (this.visiting != null) {
      if (this.visiting.defence == 0) {
        this.visiting.defence = 1; //Makes the healee's defence at least 1
      }
      this.visiting.receiveVisit(this);
    }
  }
}

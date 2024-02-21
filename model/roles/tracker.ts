import { Player } from "../rooms/player.js";
import { Room } from "../rooms/room.js";
import { Role } from "./role.js";
import { io } from "../../servers/socket.js";

export class Tracker extends Role {
  constructor(room: Room, player: Player) {
    super(
      "Tracker",
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
        "You cannot track yourself.",
      );
    } else if (recipient.playerUsername != undefined && recipient.isAlive) {
      io.to(this.player.socketId).emit(
        "receiveMessage",
        "You have chosen to track " + recipient.playerUsername + ".",
      );
      this.visiting = recipient.role;
    } else {
      io.to(this.player.socketId).emit("receiveMessage", "Invalid choice.");
    }
  }

  visit() {
    //Visits a role, and gives their defence a minimum of one
    if (this.visiting != null) {
      this.visiting.receiveVisit(this);
    }
  }

  handleVisits() {
    try {
      if (this.visiting != null) {
        if (this.visiting.visiting)
          io.to(this.player.socketId).emit(
            "receiveMessage",
            "Your target visited " +
              this.visiting.visiting.player.playerUsername +
              ".",
          );
        else
          io.to(this.player.socketId).emit(
            "receiveMessage",
            "Your target didn't visit anyone.",
          );
      }
    } catch (error) {
      console.log(error);
    }
  }
}

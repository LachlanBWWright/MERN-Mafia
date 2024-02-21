import { Player } from "../rooms/player.js";
import { Room } from "../rooms/room.js";
import { Role } from "./role.js";
import { io } from "../../servers/socket.js";

export class Sacrificer extends Role {
  constructor(room: Room, player: Player) {
    super(
      "Sacrificer",
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
        "You cannot protect yourself.",
      );
    } else if (recipient.playerUsername != undefined && recipient.isAlive) {
      io.to(this.player.socketId).emit(
        "receiveMessage",
        "You have chosen to protect " + recipient.playerUsername + ".",
      );
      this.visiting = recipient.role;
    } else {
      io.to(this.player.socketId).emit("receiveMessage", "Invalid choice.");
    }
  }

  visit() {
    if (this.visiting != null) {
      this.visiting.receiveVisit(this);
    }
  }

  handleVisits() {
    if (this.visiting != null && this.visiting.attackers.length > 0) {
      this.visiting.defence = 3;
      io.to(this.player.socketId).emit(
        "receiveMessage",
        "You have died protecting your target.",
      );
      io.to(this.visiting.player.socketId).emit(
        "receiveMessage",
        "You were attacked, but were saved by a sacrificer!",
      );
      this.damage = 99; //Makes the sacrificer die
      for (let i = 0; i < this.visiting.attackers.length; i++) {
        io.to(this.visiting.player.socketId).emit(
          "receiveMessage",
          "You were attacked by " +
            this.visiting.attackers[i].player.playerUsername +
            ", whose role is: " +
            this.visiting.attackers[i].name +
            ".",
        );
      }
    }
  }
}

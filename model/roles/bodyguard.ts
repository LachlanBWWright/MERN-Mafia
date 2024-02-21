import { Player } from "../rooms/player.js";
import { Room } from "../rooms/room.js";
import { Role } from "./role.js";
import { io } from "../../servers/socket.js";

export class Bodyguard extends Role {
  constructor(room: Room, player: Player) {
    super(
      "Bodyguard",
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
    //Visits a role, and gives their defence a minimum of one
    if (this.visiting != null) {
      if (this.visiting.defence == 0) {
        this.visiting.defence = 1; //Makes the protectee's defence at least 1
      }
      this.visiting.receiveVisit(this);
    }
  }

  handleVisits() {
    if (this.visiting != null) {
      for (let i = 0; i < this.visiting.visitors.length; i++) {
        if (
          this.visiting.visitors[i] != this &&
          this.visiting.visitors[i] != this.visiting
        ) {
          if (this.visiting.visitors[i].damage == 0)
            this.visiting.visitors[i].damage = 1;
          this.visiting.visitors[i].attackers.push(this);
        }
      }
    }
  }
}

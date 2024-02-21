import { Player } from "../rooms/player.js";
import { Room } from "../rooms/room.js";
import { Role } from "./role.js";
import { io } from "../../servers/socket.js";

export class Sniper extends Role {
  lastVisited: Role | null = null;
  constructor(room: Room, player: Player) {
    super(
      "Sniper",
      "sniper",
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
    if (recipient == this.player) {
      io.to(this.player.socketId).emit(
        "receiveMessage",
        "You cannot snipe yourself.",
      );
    } else if (recipient.playerUsername != undefined && recipient.isAlive) {
      io.to(this.player.socketId).emit(
        "receiveMessage",
        "You have chosen to snipe " + recipient.playerUsername + ".",
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
    } else this.lastVisited = null;
  }

  handleVisits() {
    if (this.visiting != null) {
      if (
        this.visiting.visiting == this.visiting ||
        this.visiting.visiting == null
      ) {
        if (this.visiting.damage < 3) this.visiting.damage = 3;
      } else if (this.lastVisited == this.visiting) {
        if (this.visiting.damage == 0) this.visiting.damage = 1;
      }
      this.lastVisited = this.visiting;
    }
  }
}

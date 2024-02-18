import Player from "../rooms/player.js";
import Room from "../rooms/room.js";
import Role from "./role.js";
import { io } from "../../servers/socket.js";

class Peacemaker extends Role {
  victoryCondition: boolean = false;
  constructor(room: Room, player: Player) {
    super(
      "Peacemaker",
      "neutral",
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
      false,
    );
    this.victoryCondition = false;
    this.room.peacemaker = this;
  }

  handleNightAction(recipient: Player) {
    //Choose who should be roleblocked
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

  visit() {
    //Visits a role, and gives their defence a minimum of one
    if (this.visiting != null) {
      this.visiting.roleblocked = true;
      this.visiting.receiveVisit(this);
    }
  }
}

export default Peacemaker;

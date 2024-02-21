import { Player } from "../rooms/player.js";
import { Room } from "../rooms/room.js";
import { Role } from "./role.js";
import { io } from "../../servers/socket.js";

export class Fortifier extends Role {
  playerFortified: Role | null = null;
  canFortify = true;

  constructor(room: Room, player: Player) {
    super(
      "Fortifier",
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
        "You cannot fortify your own house.",
      );
    } else if (
      recipient.playerUsername != undefined &&
      recipient.isAlive &&
      this.canFortify
    ) {
      io.to(this.player.socketId).emit(
        "receiveMessage",
        "You have chosen to fortify " + recipient.playerUsername + "'s house.",
      );
      this.visiting = recipient.role;
    } else if (this.playerFortified != null) {
      if (
        recipient.playerUsername != undefined &&
        this.playerFortified.player.isAlive &&
        !this.canFortify
      ) {
        io.to(this.player.socketId).emit(
          "receiveMessage",
          "You have chosen to try and remove " +
            this.playerFortified.player.playerUsername +
            "'s fortifications.",
        );
        this.visiting = recipient.role;
      } else {
        io.to(this.player.socketId).emit(
          "receiveMessage",
          "You cannot remove the fortifications from a dead player's house.",
        );
      }
    } else {
      io.to(this.player.socketId).emit("receiveMessage", "Invalid choice.");
    }
  }

  visit() {
    //Builds the fortifications
    if (this.visiting != null) {
      this.visiting.receiveVisit(this);
      if (this.canFortify) {
        //Builds fortifications
        this.canFortify = false;
        this.visiting.baseDefence += 2;
        this.playerFortified = this.visiting;
        io.to(this.playerFortified.player.socketId).emit(
          "receiveMessage",
          "Your house has been fortified!",
        );
      } else if (this.playerFortified !== null) {
        //Attempts to remove fortifications
        this.visiting.baseDefence -= 2;
        if (Math.random() > 0.5) {
          io.to(this.player.socketId).emit(
            "receiveMessage",
            "You died stripping the house of your fortifications.",
          );
          io.to(this.playerFortified.player.socketId).emit(
            "receiveMessage",
            `${this.playerFortified.player.playerUsername} died stripping your house of its fortifications.`,
          );
          this.damage = 999;
        } else {
          io.to(this.player.socketId).emit(
            "receiveMessage",
            "You stripped the house of its fortifications, and killed the owner.",
          );
          io.to(this.playerFortified.player.socketId).emit(
            "receiveMessage",
            "You died trying to stop your house from being stripped of its fortifications.",
          );
          this.playerFortified.damage = 999;
        }
      }
    }
  }

  handleVisits() {
    //Attacks the attackers of the fortified person's house
    if (this.playerFortified != null && this.visiting !== null) {
      for (let i = 0; i < this.playerFortified.attackers.length; i++) {
        if (
          this.visiting.attackers[i] != this &&
          this.visiting.attackers[i] != this.visiting
        ) {
          if (this.visiting.attackers[i].damage == 0)
            this.visiting.attackers[i].damage = 1;
          this.visiting.visitors[i].attackers.push(this);
        }
      }
    }
  }
}

import Player from "../rooms/player.js";
import Room from "../rooms/room.js";
import Role from "./role.js";
import { io } from "../../servers/socket.js";

//This class judges the alignment of the selected target (usually!)
class Judge extends Role {
  constructor(room: Room, player: Player) {
    super(
      "Judge",
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
        "You cannot inspect your own alignment.",
      );
    } else if (recipient.playerUsername != undefined && recipient.isAlive) {
      io.to(this.player.socketId).emit(
        "receiveMessage",
        "You have chosen to inspect " + recipient.playerUsername + ".",
      );
      this.visiting = recipient.role;
    } else {
      io.to(this.player.socketId).emit("receiveMessage", "Invalid choice.");
    }
  }

  visit() {
    //Visits a role, and tries to determine their alignment.
    if (this.visiting != null) {
      this.visiting.receiveVisit(this);

      if (Math.random() < 0.3) {
        let livingPlayerList = [];
        for (let i = 0; i < this.room.playerList.length; i++) {
          if (this.room.playerList[i].isAlive) {
            livingPlayerList.push(this.room.playerList[i]);
          }
        }

        io.to(this.player.socketId).emit(
          "receiveMessage",
          this.visiting.player.playerUsername +
            "'s alignment is for the " +
            livingPlayerList[
              Math.floor(Math.random() * livingPlayerList.length)
            ].role.group +
            " faction.",
        );
      } else {
        //Visits the right player, and returns their group (factional alignment)
        io.to(this.player.socketId).emit(
          "receiveMessage",
          this.visiting.player.playerUsername +
            "'s alignment is for the " +
            this.visiting.group +
            " faction.",
        );
      }
    }
  }
}

export default Judge;

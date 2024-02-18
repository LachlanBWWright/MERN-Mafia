import Role from "./role.js";
import Room from "../rooms/room.js";
import Player from "../rooms/player.js";
import { io } from "../../servers/socket.js";

//This class judges the alignment of the selected target (usually!)
class Vetter extends Role {
  researchSlots = 3;
  constructor(room: Room, player: Player) {
    super(
      "Vetter",
      "town",
      room,
      player,
      0,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
    );
  }

  handleNightAction(recipient: Player) {
    //Vote on who should be attacked
    if (this.researchSlots == 0)
      io.to(this.player.socketId).emit(
        "receiveMessage",
        "You have no research sessions left!",
      );
    else if (this.visiting == null) {
      this.visiting = this;
      io.to(this.player.socketId).emit(
        "receiveMessage",
        "You have decided to stay home and research into people's history.",
      );
    } else {
      this.visiting = null;
      io.to(this.player.socketId).emit(
        "receiveMessage",
        "You have decided not to research into people's history.",
      );
    }
  }

  visit() {
    //Selects two random people to visit
    try {
      //Gets two different players at random
      if (this.visiting === null) return;
      this.visiting.receiveVisit(this);
      this.researchSlots--;
      let randomPlayerOne = Math.floor(
        Math.random() * this.room.playerList.length,
      );
      let randomPlayerTwo = randomPlayerOne;
      while (
        randomPlayerTwo == randomPlayerOne &&
        this.room.playerList.length > 1
      )
        randomPlayerTwo = Math.floor(
          Math.random() * this.room.playerList.length,
        );

      if (Math.random() > 0.5) {
        io.to(this.player.socketId).emit(
          "receiveMessage",
          "You researched into " +
            this.room.playerList[randomPlayerOne].playerUsername +
            " and " +
            this.room.playerList[randomPlayerTwo].playerUsername +
            ", finding that at least one of them is a " +
            this.room.playerList[randomPlayerOne].role.name +
            ".",
        );
      } else {
        io.to(this.player.socketId).emit(
          "receiveMessage",
          "You researched into " +
            this.room.playerList[randomPlayerOne].playerUsername +
            " and " +
            this.room.playerList[randomPlayerTwo].playerUsername +
            ", finding that at least one of them is a " +
            this.room.playerList[randomPlayerTwo].role.name +
            ".",
        );
      }
      io.to(this.player.socketId).emit(
        "receiveMessage",
        `You have ${this.researchSlots} research sessions left.`,
      );
    } catch (error) {
      console.log(error);
    }
  }
}

export default Vetter;

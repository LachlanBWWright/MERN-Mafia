import { Role } from "../abstractRole.js";
import { Room } from "../../rooms/room.js";
import { Player } from "../../player/player.js";
import { io } from "../../../servers/socket.js";

//This class judges the alignment of the selected target (usually!)
export class Vetter extends Role {
  researchSlots = 3;

  name = "Vetter";
  group = "town";
  baseDefence = 0;
  defence = 0;
  roleblocker = false;
  dayVisitSelf = false;
  dayVisitOthers = false;
  dayVisitFaction = false;
  nightVisitSelf = true;
  nightVisitOthers = false;
  nightVisitFaction = false;
  nightVote = false;

  constructor(room: Room, player: Player) {
    super(room, player);
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
      let randomPlayerOneIdx = Math.floor(
        Math.random() * this.room.playerList.length,
      );
      let randomPlayerTwoIdx = randomPlayerOneIdx;
      while (
        randomPlayerTwoIdx == randomPlayerOneIdx &&
        this.room.playerList.length > 1
      )
        randomPlayerTwoIdx = Math.floor(
          Math.random() * this.room.playerList.length,
        );

      const randomPlayerOne = this.room.playerList[randomPlayerOneIdx];
      const randomPlayerTwo = this.room.playerList[randomPlayerTwoIdx];

      if (!randomPlayerOne || !randomPlayerTwo) {
        console.log("Random player not found");
        return;
      }

      if (Math.random() > 0.5) {
        io.to(this.player.socketId).emit(
          "receiveMessage",
          "You researched into " +
            randomPlayerOne.playerUsername +
            " and " +
            randomPlayerTwo.playerUsername +
            ", finding that at least one of them is a " +
            randomPlayerOne.role.name +
            ".",
        );
      } else {
        io.to(this.player.socketId).emit(
          "receiveMessage",
          "You researched into " +
            randomPlayerOne.playerUsername +
            " and " +
            randomPlayerTwo.playerUsername +
            ", finding that at least one of them is a " +
            randomPlayerTwo.role.name +
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

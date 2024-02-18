import Player from "../rooms/player.js";
import Room from "../rooms/room.js";
import Role from "./role.js";

class Confesser extends Role {
  victoryCondition: boolean = false;

  constructor(room: Room, player: Player) {
    super(
      "Confesser",
      "neutral",
      room,
      player,
      1,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    );
    this.victoryCondition = false;
    this.room.confesser = this;
  }
}

export default Confesser;

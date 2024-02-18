import Player from "../rooms/player.js";
import Room from "../rooms/room.js";
import RoleMafia from "./roleMafia.js";

class Mafia extends RoleMafia {
  constructor(room: Room, player: Player) {
    super(
      "Mafia",
      "mafia",
      room,
      player,
      0,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    );
  }
}

export default Mafia;

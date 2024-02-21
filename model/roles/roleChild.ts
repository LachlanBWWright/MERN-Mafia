import Player from "../rooms/player.js";
import Room from "../rooms/room";
import Role from "./role.js";

class RoleChild extends Role {
  constructor(room: Room, player: Player) {
    super(
      "Roleblocker",
      "town",
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
  }
}

export default RoleChild;

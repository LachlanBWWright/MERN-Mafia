import Role from "./role.js";

class Lawman extends Role {
  constructor(room, player) {
    super(
      "Lawman",
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
    this.isInsane = false;
  }

  handleNightAction(recipient) {
    //Vote on who should be attacked
    if (this.isInsane) {
      //Shoot at random
      this.room.io
        .to(this.player.socketId)
        .emit(
          "receiveMessage",
          "You have gone insane, and have no control over who you shoot.",
        );
    } else if (recipient == this.player) {
      this.room.io
        .to(this.player.socketId)
        .emit("receiveMessage", "You cannot shoot yourself.");
    } else if (recipient.playerUsername != undefined && recipient.isAlive) {
      this.room.io
        .to(this.player.socketId)
        .emit(
          "receiveMessage",
          "You have chosen to attack " + recipient.playerUsername + ".",
        );
      this.visiting = recipient.role;
    } else {
      this.room.io
        .to(this.player.socketId)
        .emit("receiveMessage", "Invalid choice.");
    }
  }

  visit() {
    if (this.visiting != null) {
      //Visits the person of the player choice

      if (this.isInsane)
        this.room.io
          .to(this.player.socketId)
          .emit(
            "receiveMessage",
            "You have gone insane, and are shooting someone randomly!",
          );
      if (this.visiting.damage == 0) this.visiting.damage = 1;
      this.visiting.attackers.push(this);

      this.visiting.receiveVisit(this);
      if (this.visiting.group == "town") {
        //Go insane if a member of the town got shot
        this.isInsane = true;
        this.room.io
          .to(this.player.socketId)
          .emit(
            "receiveMessage",
            "You just shot a member of the town, and have been driven insane by the guilt!",
          );
      }
    }
  }
}

export default Lawman;

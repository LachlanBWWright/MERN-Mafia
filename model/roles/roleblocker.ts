import Role from "./role.js";

class Roleblocker extends Role {
  constructor(room, player) {
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

  handleNightAction(recipient) {
    //Choose who should be roleblocked
    if (recipient == this.player) {
      this.room.io
        .to(this.player.socketId)
        .emit("receiveMessage", "You cannot block yourself.");
    } else if (recipient.playerUsername != undefined && recipient.isAlive) {
      this.room.io
        .to(this.player.socketId)
        .emit(
          "receiveMessage",
          "You have chosen to block " + recipient.playerUsername + ".",
        );
      this.visiting = recipient.role;
    } else {
      this.room.io
        .to(this.player.socketId)
        .emit("receiveMessage", "Invalid choice.");
    }
  }

  visit() {
    //Visits a role, and gives their defence a minimum of one
    if (this.visiting != null) {
      if (this.visiting.group == "town" || Math.random() > 0.5) {
        this.visiting.roleblocked = true;
        this.visiting.receiveVisit(this);
      }
    }
  }
}

export default Roleblocker;

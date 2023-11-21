import Role from "./role.js";

//This class judges the alignment of the selected target (usually!)
class Investigator extends Role {
  constructor(room, player) {
    super(
      "Investigator",
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

  handleNightAction(recipient) {
    //Vote on who should be attacked
    if (recipient == this.player) {
      this.room.io
        .to(this.player.socketId)
        .emit("receive-message", "You cannot inspect yourself.");
    } else if (recipient.playerUsername != undefined && recipient.isAlive) {
      this.room.io
        .to(this.player.socketId)
        .emit(
          "receive-message",
          "You have chosen to inspect " + recipient.playerUsername + ".",
        );
      this.visiting = recipient.role;
    } else {
      this.room.io
        .to(this.player.socketId)
        .emit("receive-message", "Invalid choice.");
    }
  }

  visit() {
    //Visits a role, and tries to determine their alignment.
    if (this.visiting != null) {
      this.visiting.receiveVisit(this);
      let possibleRoles = [];
      for (let i = 0; i < 3; i++) {
        if (Math.random() < 0.3) {
          //Give the targets role
          possibleRoles.push(this.visiting.name);
        } else {
          //Give a random player's role
          possibleRoles.push(
            this.room.playerList[
              Math.floor(Math.random() * this.room.playerList.length)
            ].role.name,
          );
        }
      }
      this.room.io
        .to(this.player.socketId)
        .emit(
          "receive-message",
          this.visiting.player.playerUsername +
            "'s role might be " +
            possibleRoles[0] +
            ", " +
            possibleRoles[1] +
            ", or " +
            possibleRoles[2] +
            ".",
        );
    }
  }
}

export default Investigator;

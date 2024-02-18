import RoleMafia from "./roleMafia.js";

class MafiaInvestigator extends RoleMafia {
  constructor(room, player) {
    super(
      "Mafia Investigator",
      "mafia",
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
      true,
    );
    this.attackVote;
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

  defaultVisit() {
    //This visits a role and attacks them. this.visiting is dictated by the faction Class.
    if (this.visiting != null) {
      this.visiting.receiveVisit(this);
      this.room.io
        .to(this.player.socketId)
        .emit(
          "receive-message",
          this.visiting.player.playerUsername +
            "'s role is " +
            this.visiting.name +
            ".",
        );
    }
  }
}

export default MafiaInvestigator;

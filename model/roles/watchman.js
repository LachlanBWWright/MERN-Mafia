import Role from "./role.js";

class Watchman extends Role {
  constructor(room, player) {
    super(
      "Watchman",
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
        .emit("receive-message", "You cannot watch yourself.");
    } else if (recipient.playerUsername != undefined && recipient.isAlive) {
      this.room.io
        .to(this.player.socketId)
        .emit(
          "receive-message",
          "You have chosen to watch " + recipient.playerUsername + ".",
        );
      this.visiting = recipient.role;
    } else {
      this.room.io
        .to(this.player.socketId)
        .emit("receive-message", "Invalid choice.");
    }
  }

  visit() {
    //Visits a role, and gives their defence a minimum of one
    if (this.visiting != null) {
      this.visiting.receiveVisit(this);
    }
  }

  handleVisits() {
    try {
      if (this.visiting != null) {
        let allVisitors = this.visiting.visitors.length;
        if (allVisitors == 1) {
          //Tells the player that nobody's visited their target - The one visiter being the watchman themself.
          this.room.io
            .to(this.player.socketId)
            .emit("receive-message", "Nobody visited your target.");
        } else if (allVisitors == 2) {
          let alibi =
            this.room.playerList[
              Math.floor(Math.random() * this.room.playerList.length)
            ].role;
          if (
            !alibi.player.isAlive ||
            alibi == this.visiting.visitors[0] ||
            alibi == this.visiting.visitors[1] ||
            alibi == this.visiting
          ) {
            //Reveals the only player visited if the random selection is dead, visitor, the person being watched, or the watchman
            if (this.visiting.visitors[0] == this) {
              this.room.io
                .to(this.player.socketId)
                .emit(
                  "receive-message",
                  "Your target was visited by " +
                    this.visiting.visitors[1].player.playerUsername +
                    ".",
                );
            } else {
              this.room.io
                .to(this.player.socketId)
                .emit(
                  "receive-message",
                  "Your target was visited by " +
                    this.visiting.visitors[0].player.playerUsername +
                    ".",
                );
            }
          } else {
            //Reveals the visitor, alongside the 'red herring' alibi.
            let realVisitor;
            if (this.visiting.visitors[0] == this) {
              realVisitor = this.visiting.visitors[1];
            } else {
              realVisitor = this.visiting.visitors[0];
            }

            if (Math.random() > 0.5) {
              this.room.io
                .to(this.player.socketId)
                .emit(
                  "receive-message",
                  "Your target was visited by " +
                    realVisitor.player.playerUsername +
                    " or " +
                    alibi.player.playerUsername +
                    ".",
                );
            } else {
              this.room.io
                .to(this.player.socketId)
                .emit(
                  "receive-message",
                  "Your target was visited by " +
                    alibi.player.playerUsername +
                    " or " +
                    realVisitor.player.playerUsername +
                    ".",
                );
            }
          }
        } else {
          let visitorList = [];
          for (let i = 0; i < this.visiting.visitors.length; i++) {
            if (
              this.visiting.visitors[i].player.isAlive &&
              this.visiting.visitors[i] != this
            ) {
              //Lists all visitors, excluding the watchman itself
              visitorList.push(this.visiting.visitors[i]);
            }
          }

          let visitorAnnouncement = "The list of visitors is: ";
          for (let i = 0; i < visitorList.length - 1; i++) {
            visitorAnnouncement = visitorAnnouncement.concat(
              visitorList[i].player.playerUsername + ", ",
            );
          }
          visitorAnnouncement = visitorAnnouncement.concat(
            "and " +
              visitorList[visitorList.length - 1].player.playerUsername +
              ".",
          );
          this.room.io
            .to(this.player.socketId)
            .emit("receive-message", visitorAnnouncement);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default Watchman;

import Role from "./role.js";

class RoleMafia extends Role {
  constructor(
    name,
    group,
    room,
    player,
    baseDefence,
    roleblocker,
    dayVisitSelf,
    dayVisitOthers,
    dayVisitFaction,
    nightVisitSelf,
    nightVisitOthers,
    nightVisitFaction,
    nightVote,
  ) {
    //Group is kept as a constructor parameter for consistency, but mafia classes will always be in the 'mafia' group.
    super(
      name,
      "mafia",
      room,
      player,
      baseDefence,
      roleblocker,
      dayVisitSelf,
      dayVisitOthers,
      dayVisitFaction,
      nightVisitSelf,
      nightVisitOthers,
      nightVisitFaction,
      nightVote,
    );
    this.attackVote = null;
    this.isAttacking = false;
  }

  handleNightVote(recipient) {
    this.attackVote = recipient;
    if (
      this.attackVote.playerUsername != undefined &&
      this.attackVote.role.faction != this.faction &&
      this.attackVote.isAlive
    ) {
      this.faction.sendMessage(
        this.player.playerUsername +
          " has voted to attack " +
          this.attackVote.playerUsername +
          ".",
      );
      this.attackVote = this.attackVote.role; //uses role for easier visiting
    } else {
      this.room.io
        .to(this.player.socketId)
        .emit("receive-message", "Invalid Vote.");
    }
  }

  handleNightAction(recipient) {
    //Vote on who should be attacked
    this.handleNightVote(recipient);
  }

  cancelNightAction() {
    //Faction-based classes should override this function
    this.room.io
      .to(this.player.socketId)
      .emit(
        "receive-message",
        "You have cancelled your class' nighttime action.",
      );
    this.visiting = null;
  }

  visit() {
    if (this.isAttacking) {
      this.visitOverride();
      this.isAttacking = false;
    } else {
      this.defaultVisit();
    }
  }

  //For when a member of the mafia attacks someone instead of
  visitOverride() {
    //This visits a role and attacks them. this.visiting is dictated by the faction Class.
    if (this.visiting != null) {
      this.room.io
        .to(this.player.socketId)
        .emit(
          "receive-message",
          "You have been chosen to do the mafia's dirty work.",
        );
      this.visiting.receiveVisit(this);
      if (this.visiting.damage == 0) this.visiting.damage = 1; //Attacks the victim
      this.visiting.attackers.push(this);
    }
  }

  //This should be overriden by child classes, unless they can only attack
  defaultVisit() {
    if (this.visiting != null) {
      this.visiting.receiveVisit(this);
      if (this.visiting.damage == 0) this.visiting.damage = 1; //Attacks the victim
      this.visiting.attackers.push(this);
    }
  }
}

export default RoleMafia;

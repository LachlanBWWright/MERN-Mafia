import { Player } from "../../player/player.js";
import { Room } from "../../rooms/room.js";
import { Role } from "../abstractRole.js";

export class Jailor extends Role {
  name = "Jailor";
  group = "town";
  baseDefence = 0;
  defence = 0;
  roleblocker = false;
  dayVisitSelf = false;
  dayVisitOthers = true;
  dayVisitFaction = false;
  nightVisitSelf = true;
  nightVisitOthers = false;
  nightVisitFaction = false;
  nightVote = false;

  constructor(room: Room, player: Player) {
    super(room, player);
  }

  handleDayAction(recipient: Player) {
    //Choose to jail a player
    if (recipient == this.player) {
      this.room.socketHandler.sendPlayerMessage(this.player.socketId, {
        name: "receiveMessage",
        data: { message: "You cannot jail yourself." },
      });
    } else if (recipient.playerUsername != undefined && recipient.isAlive) {
      this.room.socketHandler.sendPlayerMessage(this.player.socketId, {
        name: "receiveMessage",
        data: {
          message: "You have chosen to jail " + recipient.playerUsername + ".",
        },
      });
      this.dayVisiting = recipient.role;
    } else {
      this.room.socketHandler.sendPlayerMessage(this.player.socketId, {
        name: "receiveMessage",
        data: { message: "Invalid choice." },
      });
    }
  }

  handleNightAction(recipient: Player) {
    //Choose if the player who is jailed should be executed, or let go
    if (this.dayVisiting == null) {
      //this.visiting = this;
      this.room.socketHandler.sendPlayerMessage(this.player.socketId, {
        name: "receiveMessage",
        data: {
          message: "You haven't jailed anyone, so you cannot do anything.",
        },
      });
    } else {
      if (this.visiting == null) {
        //To be exectued
        this.visiting = this.dayVisiting;
        this.room.socketHandler.sendPlayerMessage(this.player.socketId, {
          name: "receiveMessage",
          data: { message: "You have decided to execute the prisoner." },
        });
        this.room.socketHandler.sendPlayerMessage(
          this.dayVisiting.player.socketId,
          {
            name: "receiveMessage",
            data: { message: "The jailor has decided to execute you" },
          },
        );
      } else {
        //Cancels the execution
        this.visiting = null;
        this.room.socketHandler.sendPlayerMessage(this.player.socketId, {
          name: "receiveMessage",
          data: { message: "You have decided not to execute the prisoner." },
        });
        this.room.socketHandler.sendPlayerMessage(
          this.dayVisiting.player.socketId,
          {
            name: "receiveMessage",
            data: { message: "The jailor has decided not to execute you" },
          },
        );
      }
    }
  }

  dayVisit() {
    //Tells the player that they've been jailed, and roleblocks them. dayVisiting is called at the end of a day session.
    if (this.dayVisiting != null) {
      this.room.socketHandler.sendPlayerMessage(
        this.dayVisiting.player.socketId,
        {
          name: "receiveMessage",
          data: { message: "You have been jailed!" },
        },
      );
      this.room.socketHandler.sendPlayerMessage(this.player.socketId, {
        name: "receiveMessage",
        data: { message: "You have jailed your target." },
      });
      this.dayVisiting.jailed = this;
      this.dayVisiting.roleblocked = true;
    }
  }

  visit() {
    //Executes the player being jailed
    if (this.visiting != null) {
      this.visiting.receiveVisit(this);
      if (this.visiting.damage < 3) this.visiting.damage = 3; //Attacks the victim
      this.visiting.attackers.push(this);
    }
  }

  handleVisits() {
    if (this.dayVisiting != null) this.dayVisiting.jailed = null; //Resets if the victim has been jailed
    if (this.dayVisiting != null) {
      //Protect the jailee if they weren't executed
      if (this.dayVisiting.baseDefence == 0) this.dayVisiting.defence = 1;
    }
  }
}
